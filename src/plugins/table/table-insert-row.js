Raptor.registerUi(new TableCellButton({
    name: 'tableInsertRow',
    applyToElement: function(cell) {
        tableInsertRow(cell.parentNode.parentNode.parentNode, tableGetCellIndex(cell).y, {
            placeHolder: '&nbsp;'
        });
    }
}));
