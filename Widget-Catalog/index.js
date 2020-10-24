// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: book-open;
// Version 1.1.0

const catalogURL = "https://raw.githubusercontent.com/ThisIsBenny/iOS-Widgets/main/Widget-Catalog/catalog.json"
const cacheMinutes = 60 * 4;

// tables
let widgetCatalogTable = new UITable();
widgetCatalogTable.showSeparators = true

// Setup Filemanager and paths
const fmCloud = FileManager.iCloud()
const fmLocal = FileManager.local()

async function loadScript(url) {
  let req = new Request(url)
  let content = await req.loadString()
  let filename = url.split('/').pop()

  return {
    content,
    filename
  }
}

function compareVersions(a, b) {
  if (a === b) {
    return 0;
  }

  var a_components = a.split(".");
  var b_components = b.split(".");

  var len = Math.min(a_components.length, b_components.length);
  for (var i = 0; i < len; i++) {
    if (parseInt(a_components[i]) > parseInt(b_components[i])) {
      return 1;
    }

    if (parseInt(a_components[i]) < parseInt(b_components[i])) {
      return -1;
    }
  }
  if (a_components.length > b_components.length) {
    return 1;
  }

  if (a_components.length < b_components.length) {
    return -1;
  }
  return 0;
}

async function downloadWidget(widget) {
  let downloadAlert = new Alert()
  downloadAlert.message = `Do you like to Download the  '${widget.name}' Widget-Script?`;
  downloadAlert.addAction('Yes')
  downloadAlert.addCancelAction('No')

  if (await downloadAlert.presentAlert() === 0) {
    let {
      content,
      filename
    } = await loadScript(widget.scriptURL)

    const scriptPath = fmCloud.joinPath(fmCloud.documentsDirectory(), filename)
    const scriptExists = fmCloud.fileExists(scriptPath)

    if (scriptExists) {
      let alreadyExistsAlert = new Alert()
      alreadyExistsAlert.message = `The Script '${filename}' already exists!`;
      alreadyExistsAlert.addAction('Replace')
      alreadyExistsAlert.addCancelAction('Cancel')

      if (await alreadyExistsAlert.presentAlert() === -1) {
        return false
      }
    }
    fmCloud.writeString(scriptPath, content)

    let successAlert = new Alert()
    successAlert.message = `Script '${filename}' saved!`;
    successAlert.addAction('Close')
    successAlert.presentAlert()

    return filename
  }
}

async function fetchCatalog(url) {
  let req = new Request(url);
  return await req.loadJSON()
}

function populateWidgetTable(table, widgets) {
  for (let i = 0; i < widgets.length; i++) {
    let row = new UITableRow()
    row.dismissOnSelect = false
    row.height = 100;
    row.cellSpacing = 10
    let imageCell = row.addImageAtURL(widgets[i].previewURL)
    imageCell.widthWeight = 20
    
    let subTitle = ""
    if (widgets[i].localVersion !== "" && compareVersions(widgets[i].version, widgets[i].localVersion) === 1) {
      subTitle = `✨ New Version (${widgets[i].version}) available ✨`
    }
    
    let nameCell = row.addText(widgets[i].name, subTitle)
    nameCell.widthWeight = 70

    let descriptionButtonCell = row.addButton('ⓘ')
    descriptionButtonCell.rightAligned()
    descriptionButtonCell.widthWeight = 10
    descriptionButtonCell.onTap = () => {
      Safari.openInApp(widgets[i].descriptionURL)
    }
    let downloadButtonCell = row.addButton('↓')
    downloadButtonCell.rightAligned()
    downloadButtonCell.widthWeight = 10
    downloadButtonCell.onTap = async function () {
      await downloadWidget(widgets[i])
    }
    table.addRow(row)
  }
}

module.exports.present = async () => {
  // Set up cache .
  const cachePath = fmLocal.joinPath(fmLocal.temporaryDirectory(), "cache-widget-catalog")
  const cacheExists = fmLocal.fileExists(cachePath)
  const cacheDate = cacheExists ? fmLocal.modificationDate(cachePath) : 0

  let catalog;
  try {
    // If cache exists and it's been less than 30 minutes since last request, use cached data.
    if (cacheExists && ((new Date()).getTime() - cacheDate.getTime()) < (cacheMinutes * 60 * 1000)) {
      console.log("Get from Cache")
      catalog = JSON.parse(fmLocal.readString(cachePath))

    } else {
      console.log("Get from API")
      catalog = await fetchCatalog(catalogURL)
      console.log("Write Data to Cache")
      try {
        fmLocal.writeString(cachePath, JSON.stringify(catalog))
      } catch (e) {
        console.log("Creating Cache failed!")
        console.log(e)
      }
    }
  } catch (e) {
    console.error(e)
    if (cacheExists) {
      console.log("Get from Cache")
      catalog = JSON.parse(fmLocal.readString(cachePath))
    } else {
      console.log("No fallback to cache possible. Due to missing cache.")
    }
  }

  // Check Version of local Script
  catalog.widgets = catalog.widgets.map((w) => {
    w.localVersion = ""
    
    const filename = w.scriptURL.split('/').pop()
    const scriptPath = fmCloud.joinPath(fmCloud.documentsDirectory(), filename)
    const scriptExists = fmCloud.fileExists(scriptPath)

    if (scriptExists) {
      const scriptContent = fmCloud.readString(scriptPath)
      const m = scriptContent.match(/Version[\s]*([\d]+(\.[\d]+){0,2})/m)
      if(m && m[1]) {
        w.localVersion = m[1]
      }
    }

    return w;
  })
  console.log(catalog)

  populateWidgetTable(widgetCatalogTable, catalog.widgets)

  await widgetCatalogTable.present()
}