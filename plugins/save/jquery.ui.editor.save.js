/**
 * @fileOverview Save plugin & ui component
 * @author David Neilson david@panmedia.co.nz
 * @author Michael Robinson mike@panmedia.co.nz
 */

/**
 * @name $.editor.plugin.save
 * @augments $.ui.editor.defaultPlugin
 * @class Provides an interface for saving the element's content via AJAX. For options see {@link $.editor.plugin.save.options}
 */
$.ui.editor.registerPlugin('save', /** @lends $.editor.plugin.save.prototype */ {

    /**
     * @name $.editor.plugin.save.options
     * @type {Object}
     * @namespace Default options
     * @see $.editor.plugin.save
     */
    options: /** @lends $.editor.plugin.save.options */  {
        
        /**
         * @type {Object}
         * @default <tt>{ attr: "name" }</tt>
         */
        id: { attr: 'name' },

        /**
         * @type {String}
         * @default "content"
         */
        postName: 'content',
        
        /**
         * @default false
         * @type {Boolean}
         */
        showResponse: false,
        
        /**
         * @default false
         * @type {Boolean}
         */
        appendId: false,

        /**
         * @default <tt>{
         *    url: '/',
         *    type: 'post',
         *    cache: false
         * }</tt>
         * @type {Object}
         */
        ajax: {
            url: '/',
            type: 'post',
            cache: false
        }
    },

    /**
     * @see $.ui.editor.defaultPlugin#init
     */
    init: function() {
    },

    /**
     * Get the identifier for this element
     * @return {String} The identifier
     */
    getId: function() {
        if (typeof(this.options.id) === 'string') {
            return this.options.id;
        } else if (this.options.id.attr) {
            return this.editor.getOriginalElement().attr(this.options.id.attr);
        }
        return null;
    },

    /**
     * Get the cleaned content for the element
     * @return {String}
     */
    getData: function() {
        var data = {};
        data[this.getId()] = this.editor.save();
        return data;
    },

    /**
     * Perform save
     */
    save: function() {
        this.message = this.editor.showLoading(_('Saving changes...'));

        // Get all unified content
        var contentData = {};
        var dirty = 0;
        this.editor.unify(function(editor) {
            if (editor.isDirty()) {
                dirty++;
                var plugin = editor.getPlugin('save');
                $.extend(contentData, plugin.getData());
            }
        });
        this.dirty = dirty;

        // Count the number of requests
        this.saved = 0;
        this.failed = 0;
        this.requests = 0;

        // Check if we are passing the content data in multiple requests (rest)
        if (this.options.multiple) {
            // Pass each content block individually
            for (var id in contentData) {
                this.ajax(contentData[id], id);
            }
        } else {
            // Pass all content at once
            this.ajax(contentData);
        }
    },

    /**
     * @param  {Object} data Data returned from server
     */
    done: function(data) {
        if (this.options.multiple) {
            this.saved++;
        } else {
            this.saved = this.dirty;
        }
        if (this.options.showResponse) {
            this.editor.showConfirm(data, {
                delay: 1000,
                hide: function() {
                    this.editor.unify(function(editor) {
                        editor.disableEditing();
                        editor.hideToolbar();
                    });
                }
            });
        }
    },

    /**
     * Called if a save AJAX request fails
     * @param  {Object} xhr
    */
    fail: function(xhr) {
        if (this.options.multiple) {
            this.failed++;
        } else {
            this.failed = this.dirty;
        }
        if (this.options.showResponse) {
            this.editor.showError(xhr.responseText);
        }
    },

    /**
     * Called after every save AJAX request
     */
    always: function() {
        if (this.dirty === this.saved + this.failed) {
            if (!this.options.showResponse) {
                if (this.failed > 0 && this.saved === 0) {
                    this.editor.showError(_('Failed to save {{failed}} content block(s).', this));
                } else if (this.failed > 0) {
                    this.editor.showError(_('Saved {{saved}} out of {{dirty}} content blocks.', this));
                } else {
                    this.editor.showConfirm(_('Successfully saved {{saved}} content block(s).', this), {
                        delay: 1000,
                        hide: function() {
                            this.editor.unify(function(editor) {
                                editor.disableEditing();
                                editor.hideToolbar();
                            });
                        }
                    });
                }
            }

            // Hide the loading message
            this.message.hide();
            this.message = null;
        }
    },

    /**
     * Handle the save AJAX request(s)
     * @param  {String} contentData The element's content
     * @param  {String} id Editing element's identfier
     */
    ajax: function(contentData, id) {
        // Create POST data
        //var data = {};

        // Content is serialized to a JSON object, and sent as 1 post parameter
        //data[this.options.postName] = JSON.stringify(contentData);

        // Create the JSON request
        var ajax = $.extend(true, {}, this.options.ajax);

        if ($.isFunction(ajax.data)) {
            ajax.data = ajax.data.apply(this, [id, contentData]);
        } else if (this.options.postName) {
            ajax.data = {};
            ajax.data[this.options.postName] = JSON.stringify(contentData);
        }

        // Get the URL, if it is a callback
        if ($.isFunction(ajax.url)) {
            ajax.url = ajax.url.apply(this, [id]);
        }

        // Send the data to the server
        this.requests++;
        $.ajax(ajax)
            .done($.proxy(this.done, this))
            .fail($.proxy(this.fail, this))
            .always($.proxy(this.always, this));
    }

});

$.ui.editor.registerUi({

    /**
     * @name $.editor.ui.save
     * @augments $.ui.editor.defaultPlugin
     * @class The save UI component
     */
    save: {
        /**
         * @see $.ui.editor.defaultUi#init
         */
        init: function(editor, element) {
            return editor.uiButton({
                title: _('Save'),
                icon: 'ui-icon-disk',
                click: function() {
                    editor.getPlugin('save').save();
                }
            });
        }
    }
});
