var bu=bu||{};bu.plugins=bu.plugins||{};bu.plugins.navigation={};
(function(f){var t={listenFor:function(c,b){var e=this._listeners;void 0===e[c]&&(e[c]=[]);e[c].push(b)},broadcast:function(c,b){var e,f=this._listeners;if(f[c])for(e=0;e<f[c].length;e+=1)f[c][e].apply(this,b||[])}};bu.signals={register:function(c){c._listeners={};f.extend(!0,c,t)}};var m={};bu.hooks={addFilter:function(c,b){void 0===m[c]&&(m[c]=[]);m[c].push(b);return this},applyFilters:function(c,b){if(void 0===m[c])return b;var e=Array.prototype.slice.apply(arguments).slice(1),f=b,d;for(d=0;d<
m[c].length;d+=1)f=m[c][d].apply(this,e);return f}}})(jQuery);
(function(f){var t=bu.plugins.navigation;t.settings={lazyLoad:!0,showCounts:!0,showStatuses:!0,deselectOnDocumentClick:!0};f(document).ready(function(){!0===f.browser.msie&&7==parseInt(f.browser.version,10)&&f(document.body).addClass("ie7");!0===f.browser.msie&&8==parseInt(f.browser.version,10)&&f(document.body).addClass("ie8");!0===f.browser.msie&&9==parseInt(f.browser.version,10)&&f(document.body).addClass("ie9")});t.tree=function(f,c){"undefined"===typeof f&&(f="base");return t.trees[f](c).initialize()};
t.trees={base:function(m,c){var b={};c=c||{};bu.signals.register(b);b.config=f.extend({},t.settings,m||{});b.data={treeConfig:{},rollback:void 0};var e=b.config,k=b.data,d=b.$el=f(e.el);if(e.themePath&&document.images){var j=new Image,p=new Image;j.src=e.themePath+"/sprite.png";p.src=e.themePath+"/throbber.gif"}var j=function(a){return bu.hooks.applyFilters("canSelectNode",a,b)},p=function(a){return bu.hooks.applyFilters("canHoverNode",a,b)},r=function(a){return bu.hooks.applyFilters("canDragNode",
a,b)};k.treeConfig={plugins:"themes types json_data ui dnd crrm bu".split(" "),core:{animation:0,html_titles:!0},ui:{selected_parent_close:!1},themes:{theme:"bu",load_css:!1},dnd:{drag_container:document},types:{types:{"default":{max_children:-1,max_depth:-1,valid_children:"all",select_node:j,hover_node:p,start_drag:r},page:{max_children:-1,max_depth:-1,valid_children:"all",select_node:j,hover_node:p,start_drag:r},section:{max_children:-1,max_depth:-1,valid_children:"all",select_node:j,hover_node:p,
start_drag:r},link:{max_children:0,max_depth:0,valid_children:"none",select_node:j,hover_node:p,start_drag:r}}},json_data:{ajax:{url:e.rpcUrl,type:"POST",data:function(a){return{child_of:(-1===a?{ID:0}:c.nodeToPost(a)).ID,post_types:e.postTypes,post_statuses:e.postStatuses,instance:e.instance,prefix:e.nodePrefix,include_links:e.includeLinks}}},progressive_render:!0},crrm:{move:{default_position:"first",check_move:function(a){var h=c.nodeToPost(a.o),g,f=!0;g=!1===h.post_meta.excluded||h.post_type===
e.linksPostType;var u=!h.originalExclude&&(0===h.originalParent||"new"===h.post_status&&h.post_type!==e.linksPostType);-1===a.cr&&(!u&&g&&!e.allowTop)&&(f=!1);a.np.length&&a.np.attr("id")!==d.attr("id")&&(g=c.nodeToPost(a.np),"publish"==h.post_status&&"publish"!=g.post_status&&(f=!1));return bu.hooks.applyFilters("moveAllowed",f,a,b)}}},bu:{lazy_load:e.lazyLoad}};e.showCounts&&(k.treeConfig.json_data.progressive_render=!1);e.initialTreeData&&(k.treeConfig.json_data.data=e.initialTreeData);k.treeConfig=
bu.hooks.applyFilters("buNavTreeSettings",k.treeConfig,d);b.initialize=function(){d.jstree(k.treeConfig);return b};b.openPost=function(a,h){var g=c.getNodeForPost(a);h=h||f.noop;if(g)d.jstree("open_node",g,h,!0);else return!1};b.selectPost=function(a,h){h=h||!0;var g=c.getNodeForPost(a);h&&d.jstree("deselect_all");d.jstree("select_node",g)};b.getSelectedPost=function(){var a=d.jstree("get_selected");return a.length?c.nodeToPost(a):!1};b.deselectAll=function(){d.jstree("deselect_all")};b.getPost=function(a){return(a=
c.getNodeForPost(a))?c.nodeToPost(a):!1};b.getPosts=function(a){var h=[],g={};(a?f.jstree._reference(d)._get_node("#"+a):d).find("> ul > li").each(function(a,d){d=f(d);g=c.nodeToPost(d);d.find("> ul > li").length&&(g.children=b.getPosts(d.attr("id")));h.push(g)});return h};b.showAll=function(){d.jstree("open_all")};b.hideAll=function(){d.jstree("close_all")};b.getPostLabel=function(a){a=c.getNodeForPost(a);return d.jstree("get_text",a)};b.setPostLabel=function(a,h){var g=c.getNodeForPost(a);d.jstree("set_text",
g,h)};b.insertPost=function(a,h){var g,f,e;if("undefined"===typeof a)throw new TypeError("Post argument for insertPost must be defined!");var l,q;a.post_parent=a.post_parent||0;a.menu_order=a.menu_order||1;a.post_parent?(g=c.getNodeForPost(a.post_parent),l=b.getPost(a.post_parent)):g=d;1==a.menu_order?(e=g.find("> ul > li").get(0),f="before"):(q=a.menu_order-2,0<=q&&(e=g.find("> ul > li").get(q),f="after"));e||(e=g,f="inside");g=e;e=h||function(a){d.jstree("deselect_all");d.jstree("select_node",a)};
a=bu.hooks.applyFilters("preInsertPost",a,l);l=c.postToNode(a);l=d.jstree("create_node",g,f,l,e);a.ID||(a.ID=l.attr("id"));return a};b.updatePost=function(a){var h=c.getNodeForPost(a),g;return h?(g=c.nodeToPost(h),a=f.extend(!0,{},g,a),d.jstree("set_text",h,a.post_title),a.post_parent=parseInt(a.post_parent,10),a.menu_order=parseInt(a.menu_order,10),h.data("post",a),e.showStatuses&&h.find("li").andSelf().each(function(){l(f(this))}),b.broadcast("postUpdated",[a]),a):!1};b.removePost=function(a){a&&
"undefined"===typeof a?(a=d.jstree("get_selected"),c.nodeToPost(a)):a=c.getNodeForPost(a);d.jstree("remove",a)};b.getAncestors=function(a){a=c.getNodeForPost(a);return d.jstree("get_path",a)};b.save=function(){k.rollback=d.jstree("get_rollback")};b.restore=function(){"undefined"!==typeof k.rollback&&(k.rollback.d.ui.selected=f([]),f.jstree.rollback(k.rollback),k.rollback=d.jstree("get_rollback"))};b.lock=function(){d.jstree("lock")};b.unlock=function(){d.jstree("unlock")};c.nodeToPost=function(a){if("undefined"===
typeof a)throw new TypeError("Invalid node!");var h,g;h=a.attr("id");g=f.extend({},!0,a.data("post"));-1===h.indexOf("post-new")&&(h=parseInt(c.stripNodePrefix(h),10));g.ID=h;g.post_title=d.jstree("get_text",a);g.menu_order=a.index()+1;g.post_parent=parseInt(g.post_parent,10);g.originalParent=parseInt(g.originalParent,10);g.originalOrder=parseInt(g.originalOrder,10);g.post_meta=g.post_meta||{};return bu.hooks.applyFilters("nodeToPost",g,a)};c.postToNode=function(a){if("undefined"===typeof a)throw new TypeError("Invalid post!");
var h;a=f.extend({},{post_title:"(no title)",post_content:"",post_status:"new",post_type:"page",post_parent:0,menu_order:1,post_meta:{},url:""},a);h=a.ID?e.nodePrefix+a.ID:"post-new-"+c.getNextPostID();return bu.hooks.applyFilters("postToNode",{attr:{id:h,rel:a.post_type},data:{title:a.post_title},metadata:{post:a}},a)};c.getNodeForPost=function(a){if("undefined"===typeof a)return!1;a=a&&"object"===typeof a?a.ID.toString():a.toString();-1===a.indexOf("post-new")&&(a=e.nodePrefix+a);a=f.jstree._reference(d)._get_node("#"+
a);return a.length?a:!1};c.getNextPostID=function(){return f('[id*="post-new-"]').length};c.stripNodePrefix=function(a){return a.replace(e.nodePrefix,"")};var n=function(a,h){var g=a.find("li").length,b=a.children("a");0===b.children(".title-count").children(".count").length&&b.children(".title-count").append('<span class="count"></span>');b=b.find("> .title-count > .count").empty();g?b.text("("+g+")"):b.text("");h&&a.find("li").each(function(){n(f(this))})},s=function(a){var b,g,c;a=a||!1;c=b=bu.hooks.applyFilters("navStatusBadges",
{excluded:{"class":"excluded",label:e.statusBadgeExcluded,inherited:!1},"protected":{"class":"protected",label:e.statusBadgeProtected,inherited:!1}});if(a)for(g in c={},b)b[g].hasOwnProperty("inherited")&&b[g].inherited&&(c[g]=b[g]);return c},l=function(a){var b,g,e,l,q,k;b=a.children("a");0===b.children(".post-statuses").length&&b.append('<span class="post-statuses"></span>');b=b.children(".post-statuses").empty();g=c.nodeToPost(a);e=[];var j;c.nodeToPost(a);l=s({inherited:!0});for(j in l)(l=a.parentsUntil("#"+
d.attr("id"),"li").filter(function(){return f(this).data("post").post_meta[j]||f(this).data("inherited_"+j)}).length)?a.data("inherited_"+j,!0):a.removeData("inherited_"+j);"publish"!=g.post_status&&e.push({"class":g.post_status,label:g.post_status});l=s();for(q in l)(k=g.post_meta[q]||a.data("inherited_"+q))&&e.push({"class":l[q]["class"],label:l[q].label});for(a=0;a<e.length;a+=1)b.append('<span class="post_status '+e[a]["class"]+'">'+e[a].label+"</span>")},q=function(a){0===a.children("ul").length?
a.attr("rel","page"):a.attr("rel","section");e.showCounts&&(a=a.parent("ul").parent("div").attr("id")!=d.attr("id")?a.parents("li:last"):a,n(a,!0))};d.bind("loaded.jstree",function(){var a=d.find("> ul > li:first-child"),a=18<=a.height()?a.height():32;d.jstree("data").data.core.li_height=a;b.broadcast("postsLoaded")});d.bind("reselect.jstree",function(){b.broadcast("postsSelected")});d.bind("lazy_loaded.jstree",function(){b.broadcast("lazyLoadComplete")});d.bind("load_node.jstree",function(a,b){if(-1!==
b.rslt.obj){var c=b.rslt.obj;e.showCounts&&n(c,!0)}});d.bind("clean_node.jstree",function(a,b){var c=b.rslt.obj;c&&-1!==c&&c.each(function(a,b){var c=f(b);c.data("buNavExtrasAdded")||(e.showStatuses&&l(c),c.data("buNavExtrasAdded",!0))})});d.bind("before.jstree",function(a,b){var c;switch(b.func){case "select_node":case "hover_node":case "start_drag":if((c=b.inst._get_node(b.args[0]))&&c.hasClass("denied"))return!1}});d.bind("create_node.jstree",function(a,d){var g=c.nodeToPost(d.rslt.obj);b.broadcast("postCreated",
[g])});d.bind("select_node.jstree",function(a,d){var g=c.nodeToPost(d.rslt.obj);b.broadcast("postSelected",[g])});d.bind("create.jstree",function(a,d){var g=d.rslt.parent,e=d.rslt.position,f=c.nodeToPost(d.rslt.obj),l=null;-1!==g&&(l=c.nodeToPost(g),q(g));f.post_parent=l?l.ID:0;f.menu_order=e+1;b.broadcast("postInserted",[f])});d.bind("remove.jstree",function(a,d){var e=d.rslt.obj,l=c.nodeToPost(e),j=d.rslt.parent,k;-1!==j&&q(j);b.broadcast("postRemoved",[l]);e.find("li").each(function(){(k=c.nodeToPost(f(this)))&&
b.broadcast("postRemoved",[k])})});d.bind("deselect_node.jstree",function(a,d){var e=c.nodeToPost(d.rslt.obj);b.broadcast("postDeselected",[e])});d.bind("deselect_all.jstree",function(){b.broadcast("postsDeselected")});d.bind("move_node.jstree",function(a,e){e.rslt.o.each(function(a,l){var j=f(l),k=c.nodeToPost(j),s=e.rslt.np,m=e.rslt.op,j=j.index()+1,n=0,p=0,r=1;d.attr("id")!==s.attr("id")&&(q(s),n=parseInt(c.stripNodePrefix(s.attr("id")),10));d.attr("id")!==m.attr("id")&&!s.is("#"+m.attr("id"))&&
(q(m),s=c.nodeToPost(m),p=s.ID);r=k.menu_order;k.post_parent=n;k.menu_order=j;b.updatePost(k);b.broadcast("postMoved",[k,p,r])})});j=function(a){if("undefined"!==typeof d[0]){var b=f.contains(d[0],a.target);a=f.contains(f("#vakata-contextmenu")[0],a.target);!b&&!a&&d.jstree("deselect_all")}};e.deselectOnDocumentClick&&f(document).bind("click",j);return b},navman:function(m,c){var b={};c=c||{};var b=t.trees.base(m,c),e=b.$el,k=b.data,d=b.config,j=function(d){d=c.nodeToPost(d);b.broadcast("editPost",
[d])},p=function(b){b=c.nodeToPost(b);b.url&&window.open(b.url)},r=function(d){d=c.nodeToPost(d);b.removePost(d)};k.treeConfig.plugins.push("contextmenu");k.treeConfig.contextmenu={show_at_node:!1,items:function(b){var e=c.nodeToPost(b),a={edit:{label:d.optionsEditLabel,action:j},view:{label:d.optionsViewLabel,action:p},remove:{label:d.optionsTrashLabel,action:r}};e.url||delete a.view;e.post_type===d.linksPostType&&(a.remove.label=d.optionsDeleteLabel);return bu.hooks.applyFilters("navmanOptionsMenuItems",
a,b)}};e.bind("loaded.jstree",function(){e.undelegate("a","contextmenu.jstree")});e.bind("clean_node.jstree",function(b,c){var a=c.rslt.obj;a&&-1!=a&&a.each(function(a,b){var c=f(b).children("a");if(!c.children(".edit-options").length){var e=f('<button class="edit-options"><ins class="jstree-icon">&#160;</ins>'+d.optionsLabel+"</button>"),l=c.children(".post-statuses");l.length?l.before(e):c.append(e)}})});var n=null;e.delegate(".edit-options","click",function(b){b.preventDefault();b.stopPropagation();
var c,a,d;c=f(this).offset();a=f(this).outerWidth();d=f(this).outerHeight();b=c.top;c=c.left;b+=d;c=c+a-180;a=f(this).closest("li");e.jstree("deselect_all");e.jstree("select_node",a);e.jstree("show_contextmenu",a,c,b);f(this).addClass("clicked");n&&n.attr("id")!=a.attr("id")&&s(n);n=a});f(document).bind("context_hide.vakata",function(){s(n)});var s=function(b){b&&b.find("> a > .edit-options").removeClass("clicked")};e.addClass("bu-navman");return b},edit_post:function(m,c){c=c||{};var b=t.trees.base(m,
c),e=b.data,k=f.extend(b.config,m||{}),d=b.$el,j=k.currentPost,p={};p.dnd={drag_container:k.treeDragContainer};f.extend(!0,e.treeConfig,p);e=function(d,e){if(e.$el.is(b.$el.selector))return c.stripNodePrefix(d.attr("id"))==j.ID};bu.hooks.addFilter("canSelectNode",e);bu.hooks.addFilter("canHoverNode",e);bu.hooks.addFilter("canDragNode",e);d.bind("loaded.jstree",function(){var b;k.ancestors&&k.ancestors.length?(b=k.ancestors.reverse(),r(0,b)):n()});var r=function(c,d){var e=d[c];e?!1===b.openPost(e,
function(){r(c+1,d)})&&b.insertPost(e,function(){r(c+1,d)}):n()},n=function(){c.getNodeForPost(j)?(b.selectPost(j),b.save()):b.insertPost(j,function(){b.selectPost(j);b.save()})};b.getCurrentPost=function(){var b;return(b=c.getNodeForPost(j))?b=c.nodeToPost(b):!1};b.setCurrentPost=function(b){j=b};d.addClass("bu-edit-post");return b}}})(jQuery);