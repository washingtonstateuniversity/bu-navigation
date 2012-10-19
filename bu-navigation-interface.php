<?php

/**
 * Helper class for creating the admin tree view of site content
 * 
 * Aids in queing up the appropriate JS/CSS files, as well as loading
 * the initial tree data.
 */ 
class BU_Navman_Interface {

	private $config;
	private $post_types;
	private $plugin;

	/**
	 * Setup an object capable of creating the navigation management interface
	 * 
	 * @todo clean this up
	 * 
	 * @param $post_types an array or comma-separated string of post types
	 * @param $config an array of extra optional configuration items
	 */
	public function __construct( $post_types = 'post', $config = array() ) {

		$this->plugin = $GLOBALS['bu_navigation_plugin'];

		if( is_array( $post_types ) )
			$post_types = implode(',', $post_types );

		$defaults = array(
			'format' => 'legacy',	// until plugins are migrated to new interface...
			'postStatuses' => array('publish','draft'),
			'themePath' => plugins_url('css/vendor/jstree/themes/bu-jstree', __FILE__ ), 
			'rpcUrl' => admin_url('admin-ajax.php?action=bu_getpages&post_type=' . $post_types ),
			'allowTop' => $this->plugin->get_setting('allow_top'),
			'lazyLoad' => true,
			'showCounts' => true,
			'nodePrefix' => 'p'
			);

		$this->config = wp_parse_args( $config, $defaults );

		$this->post_types = explode(',', $post_types );

	}

	/**
	 * Enqueue all scripts and styles needed to create the navigation management interface
	 * 
	 * Must be called before scripts are printed
	 */ 
	public function enqueue_scripts() {
		global $wp_version;

		$suffix = defined('SCRIPT_DEBUG') && SCRIPT_DEBUG ? '.dev' : '';

		$scripts_path = plugins_url('js',__FILE__);
		$vendor_path = plugins_url('js/vendor',__FILE__);
		$styles_path = plugins_url('css',__FILE__);

		// Vendor scripts
		wp_register_script( 'bu-jquery-cookie', $vendor_path . '/jquery.cookie' . $suffix . '.js', array( 'jquery' ), '00168770', true);
		wp_register_script( 'bu-jquery-tree', $vendor_path . '/jstree/jquery.jstree' . $suffix . '.js', array( 'jquery', 'bu-jquery-cookie' ), '1.0-rc3', true );
		
		//switched from jquery-json to json2 @see http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/
		wp_enqueue_script( 'json2' );

		// Main configuration file
		wp_enqueue_script( 'bu-navigation', $scripts_path . '/bu-navigation' . $suffix . '.js', array( 'jquery', 'bu-jquery-tree', 'bu-jquery-cookie', 'json2' ), '0.9', true );
		wp_enqueue_style( 'bu-navigation', $styles_path . '/vendor/jstree/themes/bu-jstree/style.css', array(), '0.9' );

		do_action( 'bu_navigation_interface_scripts' );

		// Hack due to lack of support for array data to wp_localize_script in WP < 3.3
		if( version_compare( $wp_version, '3.3', '<' ) ) {
			add_action( 'admin_print_footer_scripts', array( $this, 'print_footer_scripts' ) );
		} else {
			wp_localize_script( 'bu-navigation', 'buNavSettings', $this->get_script_context() );
		}

	}

	/**
	 * Global settings object that our Javascript files depend on
	 */ 
	public function get_script_context() {

		$settings = $this->config;

		// We handle loading of top level pages (only) on page load
		$pages = $this->get_pages( 0, array( 'depth' => 1 ) );

		$settings['initialTreeData'] = $pages;

		return apply_filters( 'bu_navigation_script_context', $settings );

	}

	/**
	 * Print dynamic script context with plugin settings for JS
	 */ 
	public function print_footer_scripts() {
		global $wp_scripts;

		// Check if bu-navigation script is queued
		if( in_array( 'bu-navigation', array_keys( $wp_scripts->registered ) ) ) {

			$data = $this->get_script_context();
			$this->localize( 'buNavSettings', $data );

		}
	}

	/**
	 * Custom version of WP_Scripts::localize to provide localization for array data
	 * 
	 * @see WP_Scripts::localize in WP 3.3 on
	 */ 
	public function localize( $object_name, $script_data, $echo = true ) {

		foreach ( (array) $script_data as $key => $value ) {
			if ( !is_scalar($value) )
				continue;

			$script_data[$key] = html_entity_decode( (string) $value, ENT_QUOTES, 'UTF-8');
		}

		$script = "var $object_name = " . json_encode($script_data) . ';';

		if ( $echo ) {
			echo "<script type='text/javascript'>\n";
			echo "/* <![CDATA[ */\n";
			echo $script;
			echo "/* ]]> */\n";
			echo "</script>\n";
			return true;
		} else {
			return $data;
		}
	}

	/**
	 * Fetches top level pages, formatting for jstree consumption
	 * 
	 * @todo
	 *  - make this extendable, so that plugins can tie in to the formatting portion to add their own attributes
	 * 
	 * @param int $parent_id post ID to start loading pages from
	 * @param array $args option configuration
	 * 	- depth = how many levels to traverse of page hierarchy (0 = all)
	 * @return array $pages an array of pages, formatted for jstree json_data consumption
	 */ 
	public function get_pages( $parent_id, $args = array() ) {

		$defaults = array(
			'depth' => 0 // Load all descendents
			);

		$args = wp_parse_args( $args, $defaults );
		extract( $args );

		$pages = array();

		/* remove default page filter and add our own */
		remove_filter('bu_navigation_filter_pages', 'bu_navigation_filter_pages_exclude');
		add_filter('bu_navigation_filter_pages', array( __CLASS__, 'filter_pages' ) );
		add_filter('bu_navigation_filter_fields', array( __CLASS__, 'filter_fields' ) );

		// Gather sections
		$section_args = array('direction' => 'down', 'depth' => $depth, 'post_types' => $this->post_types);

		// error_log('Getting pages for parent: ' . $parent_id );
		// error_log('Section args: ' . print_r( $section_args,true ) );

		$sections = bu_navigation_gather_sections( $parent_id, $section_args);

		// error_log('Sections:' . print_r( $sections,true ) );

		// Load pages in sections
		$root_pages = bu_navigation_get_pages( array(
			'sections' => $sections,
			'post_types' => $this->post_types,
			'post_status' => $this->config['postStatuses']
			)
		);

		// Structure in to parent/child sections keyed by parent ID
		$pages_by_parent = bu_navigation_pages_by_parent($root_pages);

		$load_children = false;

		// Get children if the depth argument implies it
		if( $depth == 0 || $depth > 1 )
			$load_children = true;

		// Convert to jstree formatted pages
		$pages = $this->get_formatted_pages( $parent_id, $pages_by_parent, $load_children );

		/* remove our page filter and add back in the default */
		remove_filter('bu_navigation_filter_fields', array( __CLASS__, 'filter_fields' ) );
		remove_filter('bu_navigation_filter_pages', array( __CLASS__, 'filter_pages' ) );
		add_filter('bu_navigation_filter_pages', 'bu_navigation_filter_pages_exclude');

		return $pages;

	}

	/**
	 * Handles fetching child pages and formatting for jstree consumption
	 * 
	 * @param int $parent_id post ID to fetch children of
	 * @param array $pages_by_parent array of all pages, keyed by post ID and grouped in to sections
	 * @return array $children children of specified parent, formatted for jstree json_data consumption
	 */ 
	public function get_formatted_pages( $parent_id, $pages_by_parent, $load_children = true ) {

		$children = array();

		if( array_key_exists( $parent_id, $pages_by_parent ) ) {

			$pages = $pages_by_parent[$parent_id];

			if( is_array( $pages ) && ( count( $pages ) > 0 ) ) {

				foreach ($pages as $page) {

					$has_children = false;

					if( isset($pages_by_parent[$page->ID] ) && ( is_array($pages_by_parent[$page->ID]) ) && ( count($pages_by_parent[$page->ID] ) > 0))
						$has_children = true;

					// Format attributes for jstree
					$p = $this->format_page( $page, $has_children );

					// Fetch children recursively
					if( $has_children ) {

						$p['state'] = 'closed';

						if( $load_children ) {
							$descendants = $this->get_formatted_pages( $page->ID, $pages_by_parent );

							if( count( $descendants ) > 0 ) {
								$p['children'] = $descendants;
							}
						}

					}

					array_push($children, $p);
				}

			}

		}

		return $children;

	}

	/**
	 * Given a WP post object, return an array of data formated for consumption by jstree
	 * 
	 * @param StdClass $page WP post object
	 * @return array $p array of data with markup attributes for jstree json_data plugin
	 */ 
	public function format_page( $page, $has_children = false ) {
		// Label
		if( !isset( $page->navigation_label ) ) {
			$page->navigation_label = apply_filters('the_title', $page->post_title);
		}

		// wptexturize converts quotes to smart quotes, need to reverse that for display here
		$page->navigation_label = wp_specialchars_decode( $page->navigation_label, ENT_QUOTES );
		$page->navigation_label = $this->convert_smart_chars( $page->navigation_label );

		// Base format
		$p = array(
			'attr' => array(
				'id' => $this->add_node_prefix( $page->ID ),
				'rel' => ($page->post_type == 'link' ? $page->post_type : 'page' ),
				),
			'data' => $page->navigation_label,
			'metadata' => array(
				'post_status' => $page->post_status,
				'post_type' => $page->post_type,
				'post_parent' => $page->post_parent,
				'menu_order' => $page->menu_order,
				'post_meta' => array(
					'excluded' => isset($page->excluded) ? $page->excluded : false,
					'restricted' => isset($page->restricted) ? $page->restricted : false
					)
				)
			);

		if( 'link' == $page->post_type ) {
			$p['metadata']['post_content'] = $page->post_content;
			$p['metadata']['post_meta'] = array(
				BU_NAV_META_TARGET => $page->target
				);
		}

		if( $has_children ) {
			$p['attr']['rel'] = 'section';
		}

		// Apply general format page filters first
		$p = apply_filters( 'bu_navigation_interface_format_page', $p, $page, $has_children );

		$format = $this->config['format'];

		// But give priority to more specific format filters
		return apply_filters( 'bu_navigation_interface_format_page_' . $format, $p, $page, $has_children );

	}

	/**
	 * Default navigation manager page filter
	 * 
	 * Appends "excluded" and "restricted" properties to each post object
	 * 
	 * @todo
	 * 	- make this more extendable, so that plugins can tie in here and add their own properties
	 */ 
	public static function filter_pages( $pages ) {
		global $wpdb;

		$filtered = array();

		if ((is_array($pages)) && (count($pages) > 0)) {

			/* page exclusions */
			$ids = array_keys($pages);

			$query = sprintf("SELECT post_id, meta_value FROM %s WHERE meta_key = '%s' AND post_id IN (%s) AND meta_value != '0'", $wpdb->postmeta, BU_NAV_META_PAGE_EXCLUDE, implode(',', $ids));

			$exclusions = $wpdb->get_results($query, OBJECT_K); // get results as objects in an array keyed on post_id
			if (!is_array($exclusions)) $exclusions = array();

			/* access restrictions */

			$restricted = array();

			// @todo move this query to the access control plugin
			// look at bu-section-editing/plugin-support/bu-navigation
			if (class_exists('BuAccessControlPlugin')) {

				$acl_option = defined( 'BuAccessControlList::PAGE_ACL_OPTION' ) ? BuAccessControlList::PAGE_ACL_OPTION : BU_ACL_PAGE_OPTION;

				$query = sprintf("SELECT post_id, meta_value FROM %s WHERE meta_key = '%s' AND post_id IN (%s) AND meta_value != '0'", $wpdb->postmeta, $acl_option, implode(',', $ids));

				$restricted = $wpdb->get_results($query, OBJECT_K); // get results as objects in an array keyed on post_id
				if (!is_array($restricted)) $restricted = array();
			}

			/* set exclusions and acls */
			foreach ($pages as $page) {

				/* exclusions */
				if (array_key_exists($page->ID, $exclusions)) {
				
					$page->excluded = TRUE;
				
				} else {
					
					$parent_id = $page->post_parent;

					while( ($parent_id) && (array_key_exists($parent_id, $pages)) ) {

						if( array_key_exists($parent_id, $exclusions) ) {
							$page->excluded = TRUE;
							break;
						}

						$parent_id = $pages[$parent_id]->post_parent;
					}

				}

				/* restrictions */
				// @todo move to access-control plugin
				$page->restricted = FALSE;

				if( array_key_exists($page->ID, $restricted) ) {

					$page->restricted = TRUE;

				} else {
					
					$parent_id = $page->post_parent;

					while( ($parent_id) && (array_key_exists($parent_id, $pages)) ) {

						if( array_key_exists($parent_id, $restricted) ) {
							$page->restricted = TRUE;
							break;
						}

						$parent_id = $pages[$parent_id]->post_parent;

					}

				}

				$filtered[$page->ID] = $page;
			}

		}

		return $filtered;

	}

	/**
	 * Filter wp_post columns to fetch from DB
	 */
	public static function filter_fields( $fields ) {

		// Adding post status so we can include status indicators in tree view
		$fields[] = 'post_status';

		return $fields;

	}

	public function convert_smart_chars( $input ) {

		$search = array("&#8216;", "&#8217;", "&#8220;", "&#8221;", "&#8211;", "&#8212;", "&#8230;");
		$replace = array("'", "'", '"', '"', '-', '--', '...');
		return str_replace($search, $replace, $input);

	}

	public function strip_node_prefix( $id ) {

		return intval(str_replace( $this->config['nodePrefix'], '', $id ));

	}

	public function add_node_prefix( $id ) {

		return sprintf('%s%d', $this->config['nodePrefix'], $id );

	}

}

// ====== Backwards compatibility ====== //

function bu_navman_filter_pages( $pages ) {

	return BU_Navman_Interface::filter_pages( $pages );

}

function bu_navigation_format_page_legacy( $p, $page, $has_children) {

	$p = array(
		'attr' => array(
			'id' => sprintf('p%d', $page->ID ),
			'rel' => ($page->post_type == 'link' ? $page->post_type : 'page' ),
			),
		'data' => $page->navigation_label
		);

	if( $has_children ) {
		$p['attr']['rel'] = 'folder';
	}

	$classes = array();

	if (isset($page->excluded) && $page->excluded)
	{
		$p['attr']['rel'] .= '_excluded';
		array_push($classes, 'excluded');
	}

	if ($page->restricted)
	{
		$p['attr']['rel'] .= '_restricted';
		array_push($classes, 'restricted');
	}

	$p['attr']['class'] = implode(' ', $classes);

	return $p;

}

add_filter('bu_navigation_interface_format_page_legacy', 'bu_navigation_format_page_legacy', 10, 3 );

