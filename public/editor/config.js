CKEDITOR.editorConfig = function (config) {
    config.language = 'en';
    config.uiColor = '#F7B42C';
    config.height = 800;
    config.toolbarCanCollapse = true;
    config.entities = false;
    config.extraPlugins = 'html5audio,save,codemirror,uploadimage,filebrowser';
    config.allowedContent = true;
    config.removeButtons = 'Replace,Scayt,About,NewPage,Flash,HorizontalRule,PageBreak,Language,Form,Checkbox,Radio,TextField,Textarea,Select,Button,ImageButton,HiddenField,Strike,CopyFormatting,Font,FontSize,TextColor,BGColor,ShowBlocks,Outdent,Indent,CreateDiv,Blockquote,Smiley,Iframe,Templates,Paste,PasteText,PasteFromWord,Table,Subscript';
    config.toolbarGroups = [
        { name: 'tools', groups: ['tools'] },
        { name: 'document', groups: ['document', 'doctools'] },
        { name: 'styles', groups: ['styles'] },
        { name: 'insert', groups: ['insert'] },
        { name: 'editing', groups: ['find', 'selection', 'spellchecker', 'editing'] },
        { name: 'basicstyles', groups: ['basicstyles', 'cleanup'] },
        { name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align', 'bidi', 'paragraph'] },
        { name: 'clipboard', groups: ['clipboard', 'undo'] },
        { name: 'forms', groups: ['forms'] },
        { name: 'links', groups: ['links'] },
        { name: 'colors', groups: ['colors'] },
        { name: 'others', groups: ['others'] },
        { name: 'about', groups: ['about'] },
        { name: 'mode', groups: ['mode'] }
    ];
    config.removePlugins = 'wsc,scayt,contextmenu,liststyle,tabletools,tableselection';
    config.disableNativeSpellChecker = false;
    config.uploadUrl = '/idara/admin/upload';
    config.filebrowserUploadUrl = '/idara/admin/upload';
    //config.autosave_saveOnDestroy = true;
    // config.contentsCss = '/editor/contents_fr.css';

    // Ajouter des styles personnalisés
    config.stylesSet = 'custom_styles';

    config.specialChars = ['ā', 'Ā', 'ḍ', 'Ḍ', 'ḥ', 'Ḥ', 'ī', 'Ī', 'ṣ', 'Ṣ', 'ṭ', 'Ṭ', 'ū', 'Ū', 'é', 'è', 'ê', 'É', 'È', 'Ê', 'à', 'â', 'À', 'Â', 'ô', 'Ô', 'ù', 'û', 'Ù', 'Û', 'ï', 'Ï', '«', '»', 'ʿ', '’', 'ﷺ', '“', '”', 'ç'];

};

// Définir tous les styles personnalisés dans un tableau
CKEDITOR.stylesSet.add('custom_styles', [
    {
        name: 'Translit',
        element: 'p',
        attributes: { class: 'translit' }
    },
    {
        name: 'Arabic',
        element: 'p',
        attributes: { class: 'arabic' }
    },
    {
        name: 'Arab',
        element: 'span',
        attributes: { class: 'arab' }
    },
    {
        name: 'Quran',
        element: 'p',
        attributes: { class: 'quran' }
    }
]);

//,autosave
//config.contentsLangDirection = 'rtl';
