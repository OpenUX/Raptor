$.ui.editor.registerPlugin('clean', {
    options: {
        stripAttrs: ['_moz_dirty'],
        stripAttrContent: {
            type: '_moz'
        },
        stripEmptyTags: [
            'h1', 'h2', 'h3', 'h4', 'h5',  'h6',
            'p'
        ]
    },
    
    init: function(editor, options) {
        editor.bind('change', this.clean, this);
    },
        
    clean: function() {
        var i;
        for (i = 0; i < this.options.stripAttrs.length; i++) {
            this.editor.getElement()
                .find('[' + this.options.stripAttrs[i] + ']')
                .removeAttr(this.options.stripAttrs[i]);
        }
        for (i = 0; i < this.options.stripAttrContent.length; i++) {
            this.editor.getElement()
                .find('[' + i + '="' + this.options.stripAttrs[i] + '"]')
                .removeAttr(this.options.stripAttrs[i]);
        }
        for (i = 0; i < this.options.stripEmptyTags.length; i++) {
            this.editor.getElement()
                .find(this.options.stripEmptyTags[i] + ':empty')
                .remove();
        }
    }
});

$.ui.editor.registerUi({
    clean: {
        
        init: function(editor) {
            return editor.uiButton({
                title: _('Remove unnecessary markup from editor content'),
                click: function() {
                    editor.getPlugin('clean').clean();
                }
            });
        }
    }
});