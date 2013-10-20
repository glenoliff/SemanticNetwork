
function GetPageFromStorage(pageId) {

    var page = JSON.parse(localStorage.getItem('com.glenbass.SemanticNetwork.' + pageId));
    var newTypedPage = null;

    if (page != null) {
        var newTypedPage = new ItemPage(page.id, page.title, page.items);
    }

    return newTypedPage;
}

function StorePage(page, pageId) {
    localStorage.setItem('com.glenbass.SemanticNetwork.' + pageId, JSON.stringify(page));
}

function GetItemCounts(pageId) {

    var itemCounts = 0;
    var page = GetPageFromStorage(pageId);

    if (page !== null) {

        if (page.items !== null && page.items !== undefined) {
            itemCounts = page.items.length;
        }
    }

    return itemCounts;
}

function LoadItems(pageId) {

    var itemCounts = 0;
    var id = null;
    var text = null;
    var li = null;
    var page = GetPageFromStorage(pageId);

    $('#pageId').val(page.id);
    $('#pageTitle').text(page.title);

    //Clear the elements in the list
    $('#itemList').empty();

    for (var i = 0; i < page.items.length; i++) {

        text = page.items[i].text;
        id = page.items[i].id;
        itemCounts = 0;

        if (id === null || id === undefined) {
            li = $("<li/>").attr("data-theme", "e");
            $('#itemList').append(li.text(text));
        } else {
            var li = $('<li/>').attr("data-theme", "a");
            var anchor = $("<a></a>").attr("href", id).text(text);
            var spanCount = "";

            itemCounts = GetItemCounts(id);

            if (itemCounts > 0) {
                //create the span that will store item counts
                spanCount = $("<span class='ui-li-count ui-btn-up-c ui-btn-corner-all'></span>").append(itemCounts);
            }

            //create node
            $('#itemList').append((li).append(anchor).append(spanCount));
        }
    }

    PopulateFromDropDownList();
    PopulateDeleteDropDownList(page.id);
    PopulateRenameDropDownList();

    //Refresh list 
    $('#itemList').listview('refresh');
}

function WireUpEvents() {

    $("#btnHome").on("click", Navigate);
    $("#btnMove").on("click", ElementMove);
    $("#btnAdd").on("click", ElementAdd);
    $("#btnDelete").on("click", ElementDelete);
    $("#btnRename").on("click", ElementRename);

    //Change event on the from drop down list
    $("#divMove").on("change", "#ddlFrom", PopulateSecondList);

    //Handle clicking of navigation links
    $("#itemList").on("click", "a", Navigate);
}

function InitialPageLoad() {

    if (Modernizr.localstorage) {

        var pageId = 'Home';

        //At a minimum, we have to assume that we've got a landing page, even upon the first load
        var page = GetPageFromStorage(pageId);

        //TODO: rework this once other functionality is available
        if (page == null) {
            page = new ItemPage(pageId, 'Home');
            StorePage(page, pageId);
        }

        $('#divNoLocalStorage').hide();
        $('#pageContainer').show();

        WireUpEvents();

        LoadItems(pageId);

    } else {
        $('#divNoLocalStorage').show();
        $('#pageContainer').hide();
    }
}

function Navigate(event) {

    event.preventDefault();
    event.stopPropagation();

    var anchor = this;
    var pageIdToNavigateTo = $(anchor).attr("href");

    LoadItems(pageIdToNavigateTo);
}

function AddTextElementToPage(pageId, textToAdd) {

    var page = GetPageFromStorage(pageId);

    page.AddTextItem(textToAdd);

    StorePage(page, pageId);
}

function MoveElement(from, to, currentPageId) {

    var pageId = $("#pageId").val();
    var fromPage = GetPageFromStorage(pageId);
    var toPageId = null;
    var toPage = null;
    var itemToMove;

    for (var i = 0; i < fromPage.items.length; i++) {

        if (fromPage.items[i].text === to) {
            toPageId = fromPage.items[i].id;
        }
    }

    if (toPageId !== null) {
        toPage = GetPageFromStorage(toPageId);
    }

    //Pull item from the source page
    itemToMove = fromPage.RemoveItem(from);

    //if not found, it's not a sub page yet
    if (toPage === null) {

        //link up with current element on page so we can link
        fromPage.PromoteToPage(to);

        toPage = new ItemPage(to, to);
    }

    //Insert it into the destination page
    toPage.AddItem(itemToMove);

    StorePage(toPage, toPage.id);
    StorePage(fromPage, fromPage.id);
}

function RenameElement(from, to) {

    var pageId = $("#pageId").val();
    var fromPage = GetPageFromStorage(pageId);

    for (var i = 0; i < fromPage.items.length; i++) {

        if (fromPage.items[i].text === from) {

            //For now, we're going to assume that there will be no collisions with
            //  multiple categories with the same Ids. We're going to fix this by
            //  giving every category a unique identifier check for leaf node 
            fromPage.items[i].text = to;
        }
    }

    StorePage(fromPage, fromPage.id);
}

function ElementAdd() {

    var pageId = $("#pageId").val();
    var txtToAdd = $("#txtAdd").val();

    AddTextElementToPage(pageId, txtToAdd);
    $("#txtAdd").val("");
    LoadItems(pageId);
}

function ElementMove(event) {

    event.preventDefault();
    event.stopPropagation();

    var fromDdl = $("#ddlFrom");
    var toDdl = $("#ddlTo");
    var pageId = $("#pageId").val();

    var fromSelected = $(fromDdl).val();
    var toSelected = $(toDdl).val();

    MoveElement(fromSelected.trim(), toSelected.trim(), pageId);

    //load page
    LoadItems(pageId);
}

function ElementDelete(event) {

    event.preventDefault();
    event.stopPropagation();

    var deleteDdl = $("#ddlDeleteFrom");
    var pageId = $("#pageId").val();
    var fromSelected = $(deleteDdl).val();
    var page = GetPageFromStorage(pageId);

    var from = fromSelected.trim();

    if (from.length > 0) {

        //Removes element from list of items in model
        page.RemoveItem(fromSelected.trim());

        //Persist Change
        StorePage(page, pageId);

        //load page
        LoadItems(pageId);
    }
}

function ElementRename(event) {

    event.preventDefault();
    event.stopPropagation();

    var pageId = $("#pageId").val();
    var txtRename = $("#txtRename").val();
    var renameDdl = $("#ddlRename");

    var renameSelected = $(renameDdl).val();

    RenameElement(renameSelected.trim(), txtRename.trim());

    $("#txtRename").val("");

    //Load Page
    LoadItems(pageId);
}

function AddItemToDropDown(optionText, destDropDownSelector) {
    $(destDropDownSelector).append($("<option />").val(optionText).text(optionText));
}

////
// Utility method for populating drop down list with items
//  from the list on the current page's view
////
function PopulateDropDownWithItemsFromList(ddl) {

    //Clear out list
    $(ddl).empty();

    //Add blank element first
    AddItemToDropDown("", ddl);

    //Add other elements
    $("#itemList").find("li").each(
        function () {

            var anchor = $(this).find("a");

            if (anchor.length == 0) {
                AddItemToDropDown(this.innerText, ddl);
            } else {
                //We're only ever going to get a single child w/ an a tag,
                //  just grab the first one if we've made it this far
                AddItemToDropDown(anchor[0].innerText, ddl);
            }
        }
    );

    $(ddl).selectmenu('refresh');
}

function PopulateFromDropDownList() {

    var ddlFrom = $("#ddlFrom")

    PopulateDropDownWithItemsFromList(ddlFrom);

    //Clear "To" List
    $("#ddlTo").empty();

    //Refresh "To" List
    $("#ddlTo").selectmenu('refresh');
}

function PopulateRenameDropDownList() {

    var ddlRename = $("#ddlRename")

    PopulateDropDownWithItemsFromList(ddlRename);
}

function PopulateSecondList(event) {

    event.preventDefault();
    event.stopPropagation();

    var firstDropDown = this;
    var selectedValue = $(firstDropDown).val();

    //get a reference to the second dropdown
    var ddlTo = $("#ddlTo");

    //clear out the dropdown
    $(ddlTo).empty();

    if (selectedValue != "") {

        //Add blank element first
        AddItemToDropDown("", ddlTo);

        $(firstDropDown).children('option').each(function () {

            var value = $(this).val();

            if (value != "" && value != selectedValue) {
                AddItemToDropDown(value, ddlTo);
            }
        });

        //        $(secondDdl).prop('disabled', false);
    } else {
        //        $(secondDdl).prop('disabled', true);
    }

    $(ddlTo).selectmenu('refresh', true);
}

function PopulateDeleteDropDownList(pageId) {

    //var pageId = $("#pageId").val();
    var ddlDelete = $("#ddlDeleteFrom")
    var page = GetPageFromStorage(pageId);

    $(ddlDelete).empty();

    if (page.items.length > 0) {

        AddItemToDropDown("", ddlDelete);

        for (var i = 0; i < page.items.length; i++) {

            //For now, only allow deletion of items that don't have children
            if (page.items[i].id === undefined || page.items[i].id === null) {
                AddItemToDropDown(page.items[i].text, ddlDelete);
            }
        }
    }

    //btnDelete
    $(ddlDelete).selectmenu('refresh', true);
}