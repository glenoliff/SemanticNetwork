var ItemElement = function (itemText, itemId) {
    this.id = itemId;
    this.text = itemText;
};

var ItemPage = function (idVal, titleVal, itemElements) {

    //Replace whitespace characters with underscores
    this.idReplaceExp = /\s+/g;

    this.id = idVal.replace(this.idReplaceExp, "_");
    this.title = titleVal;

    if (itemElements === undefined || itemElements === null) {
        this.items = new Array();
    } else {
        this.items = itemElements;
    }
};

ItemPage.prototype = function () {

    removeItem = function (itemText) {

        var itemToMoveIndex, itemToRemove;

        //get the object to remove
        //get the index where it resides
        for (var j = 0; j < this.items.length; j++) {

            if (this.items[j].text == itemText) {
                itemToRemove = this.items[j];
                itemToMoveIndex = j;
            }
        }

        //splice the existing array, removing the element
        this.items.splice(itemToMoveIndex, 1);

        return itemToRemove;
    },

    addItem = function (item) {

        if (this.items == null) {
            this.items = new Array();
        }

        this.items.push(item);
    },

    addTextItem = function (text) {
        var itemToAdd = new ItemElement();

        itemToAdd.text = text;

        this.AddItem(itemToAdd);
    },

    promoteToPage = function (text) {

        for (var i = 0; i < this.items.length; i++) {
            
            if (this.items[i].text == text) {
                this.items[i].id = this.items[i].text.replace(this.idReplaceExp, "_");
            }
        }
    };

    return {
        AddItem: addItem,
        AddTextItem: addTextItem,
        PromoteToPage: promoteToPage,
        RemoveItem: removeItem
    };

}();
