if("undefined"===typeof bu||"undefined"===typeof bu.plugins||"undefined"===typeof bu.plugins.navigation)throw new TypeError("BU Navigation Metabox dependencies have not been met!");
(function(a){bu.plugins.navigation.views=bu.plugins.navigation.views||{};var e;bu.plugins.navigation.views.Metabox={el:"#bunavattrsdiv",ui:{treeContainer:"#edit-post-tree",moveBtn:"#move-post-button",breadcrumbs:"#bu-post-breadcrumbs"},inputs:{label:'[name="nav_label"]',visible:'[name="nav_display"]',postID:'[name="post_ID"]',originalStatus:'[name="original_post_status"]',parent:'[name="parent_id"]',order:'[name="menu_order"]',autoDraft:'[name="auto_draft"]'},data:{modalTree:void 0,breadcrumbs:"",
label:""},initialize:function(){var b,c,d,f,e;this.settings=nav_metabox_settings;this.settings.el=this.ui.treeContainer;this.settings.isNewPost=1==a(this.inputs.autoDraft).val()?!0:!1;b=a(this.inputs.originalStatus).val();c=parseInt(a(this.inputs.parent).val(),10);d=parseInt(a(this.inputs.order).val(),10);f=a(this.inputs.label).val()||"(no title)";e=a(this.inputs.visible).attr("checked")||!1;this.settings.currentPost={ID:parseInt(a(this.inputs.postID).val(),10),post_title:f,post_status:"auto-draft"==
b?"new":b,post_parent:c,menu_order:d,post_meta:{excluded:!e},originalParent:c,originalExclude:!e};a(this.ui.treeContainer).addClass("current-post-status-"+b);this.$el=a(this.el);this.loadNavTree();this.attachHandlers();return this},loadNavTree:function(){"undefined"===typeof this.data.modalTree&&(this.data.modalTree=ModalPostTree(this.settings),this.data.modalTree.listenFor("locationUpdated",a.proxy(this.onLocationUpdated,this)))},attachHandlers:function(){this.$el.delegate(this.ui.moveBtn,"click",
this.data.modalTree.open);this.$el.delegate(this.inputs.label,"blur",a.proxy(this.onLabelChange,this));this.$el.delegate(this.inputs.visible,"click",a.proxy(this.onToggleVisibility,this))},onLabelChange:function(){var b=a(this.inputs.label).attr("value");this.settings.currentPost.post_title=b;e.updatePost(this.settings.currentPost);e.save();this.updateBreadcrumbs(this.settings.currentPost)},onToggleVisibility:function(b){var c=a(b.target).attr("checked"),d=nav_metabox_settings.topLevelDisabled+"\n\n"+
nav_metabox_settings.topLevelNotice;c&&!this.isAllowedInNavigationLists(this.settings.currentPost)?(b.preventDefault(),this.notify(d)):(this.settings.currentPost.post_meta.excluded=!c,e.updatePost(this.settings.currentPost),e.save())},onLocationUpdated:function(b){a(this.inputs.parent).val(b.post_parent);a(this.inputs.order).val(b.menu_order);this.updateBreadcrumbs(b);this.settings.currentPost=b},updateBreadcrumbs:function(b){var c,d,f;c=e.getAncestors(b.ID);d=a(this.ui.breadcrumbs).clone().empty();
a.each(c,function(b,e){f=a("<li></li>").html(e);b<c.length-1?f.append("<ul></ul>"):f.addClass("current");0===b?d.append(f):d.find("ul").last().append(f)});1<d.find("li").length?a(this.ui.breadcrumbs).replaceWith(d):a(this.ui.breadcrumbs).html('<li class="current">'+nav_metabox_settings.topLevelLabel+"</li>")},isAllowedInNavigationLists:function(a){return!(!1===a.originalExclude&&0===a.originalParent)&&0===a.post_parent?this.settings.allowTop:!0},notify:function(a){alert(a)}};ModalPostTree=bu.plugins.navigation.views.ModalPostTree=
function(b){var c={},d=c.conf={treeContainer:"#edit-post-tree",toolbarContainer:".post-placement-toolbar",navSaveBtn:"#bu-post-placement-save",navCancelBtn:"#bu-post-placement-cancel",treeDragContainer:"#TB_ajaxContent"},d=a.extend(d,b);bu.signals.register(c);c.open=function(f){var b=a(window).width(),d=a(window).height(),b=720<b?720:b,h=f.target.title||f.target.name||null,g=f.target.href||f.target.alt;f=f.target.rel||!1;g=g.replace(/&width=[0-9]+/g,"");g=g.replace(/&height=[0-9]+/g,"");tb_show(h,
g+"&width="+(b-80)+"&height="+(d-85),f);c.scrollToSelection();a("#TB_window").bind("unload tb_unload",function(){c.saving?c.saving=!1:e.restore()});return!1};c.scrollToSelection=function(){var f,b,c;f=a(d.treeContainer).jstree("get_selected");f.length&&(b=a(d.treeDragContainer),c=b.innerHeight(),f=f.position().top+f.height()/2-c/2,0<f&&b.scrollTop(f))};c.onUpdateLocation=function(a){a.preventDefault();c.broadcast("locationUpdated",[e.getCurrentPost()]);e.save();c.saving=!0;tb_remove()};c.onCancelMove=
function(a){a.preventDefault();tb_remove()};e=c.tree=bu.plugins.navigation.tree("edit_post",d);b=a(d.toolbarContainer);b.delegate(d.navSaveBtn,"click",c.onUpdateLocation);b.delegate(d.navCancelBtn,"click",c.onCancelMove);d.lazyLoad?e.listenFor("lazyLoadComplete",e.save):e.listenFor("postsSelected",e.save);return c}})(jQuery);var tb_position;
(function(a){tb_position=function(){var e=a("#TB_window"),b=a(window).width(),c=a(window).height(),d=720<b?720:b;e.size()&&(e.width(d-50).height(c-45),a("#TB_inline").width(d-80).height(c-90),e.css({"margin-left":"-"+parseInt((d-50)/2,10)+"px"}),"undefined"!=typeof document.body.style.maxWidth&&e.css({top:"20px","margin-top":"0"}));return a("a.thickbox").each(function(){var b=a(this).attr("href");b&&(b=b.replace(/&width=[0-9]+/g,""),b=b.replace(/&height=[0-9]+/g,""),a(this).attr("href",b+"&width="+
(d-80)+"&height="+(c-85)))})};a(window).resize(function(){tb_position()})})(jQuery);jQuery(document).ready(function(){bu.plugins.navigation.metabox=bu.plugins.navigation.views.Metabox.initialize()});