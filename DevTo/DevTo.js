// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: green; icon-glyph: newspaper;
// Version 1.0.0

////////////////////////////////////////////////////////////////////////////////
//////////////////////////         User-Config         /////////////////////////
////////////////////////////////////////////////////////////////////////////////

// How many minutes should the cache be valid
const cacheMinutes = 60

////////////////////////////////////////////////////////////////////////////////
//////////////////////////         Dev Settings         ////////////////////////
////////////////////////////////////////////////////////////////////////////////

const debug = false
config.widgetFamily = config.widgetFamily || 'medium'

////////////////////////////////////////////////////////////////////////////////
//////////////////////////         System Settings         /////////////////////
////////////////////////////////////////////////////////////////////////////////

const spacingBetweenLinks = 5

const numberOfArticles = {  
  small: 1,
  medium: 6,
  large: 15
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

var today = new Date()

// Set up the file manager.
const files = FileManager.local()

// Set up cache
const cachePath = files.joinPath(files.cacheDirectory(), "widget-devto-" + config.widgetFamily)
const cacheExists = files.fileExists(cachePath)
const cacheDate = cacheExists ? files.modificationDate(cachePath) : 0

// Get Data
let result
let lastUpdate
try {
  // If cache exists and it's been less than 30 minutes since last request, use cached data.
  if (cacheExists && (today.getTime() - cacheDate.getTime()) < (cacheMinutes * 60 * 1000)) {
    console.log("Get from Cache")
    result = JSON.parse(files.readString(cachePath))
    lastUpdate = cacheDate
  } else {
    console.log("Get from API")
    const req = new Request(`https://dev.to/search/feed_content?per_page=${numberOfArticles[config.widgetFamily]}&page=0&sort_by=hotness_score&sort_direction=desc&approved=&class_name=Article`)
  
    result = (await req.loadJSON()).result
    lastUpdate = today
    console.log("Write Data to Cache")
    try {
      files.writeString(cachePath, JSON.stringify(result))
    } catch (e) {
      console.log("Creating Cache failed!")
      console.log(e)
    }
  }
} catch (e) {
  console.error(e)
  if (cacheExists) {
    console.log("Get from Cache")
    result = JSON.parse(files.readString(cachePath))
    lastUpdate = cacheDate
  } else {
    console.log("No fallback to cache possible. Due to missing cache.")
  }
}

if (debug) {  
  console.log(JSON.stringify(result, null, 2))
}

const widget = new ListWidget()
if (config.widgetFamily !== 'small') {
  widget.addSpacer(0)

  let firstLineStack = widget.addStack()
  
  let provider = firstLineStack.addText("Dev.to")
  provider.font = Font.boldSystemFont(12)
  
    // Last Update
  firstLineStack.addSpacer()
  lastUpdateStack = firstLineStack.addStack()
  lastUpdateStack.layoutVertically()
  lastUpdateStack.addSpacer(3)
  let lastUpdateText = lastUpdateStack.addDate(lastUpdate)
  lastUpdateText.font = Font.systemFont(8)
  lastUpdateText.rightAlignText()
  lastUpdateText.applyTimeStyle()
  widget.addSpacer(8)
  
  const stack = widget.addStack()  
  stack.layoutVertically()
  stack.spacing = spacingBetweenLinks

  result.forEach((r) => {  
    const row = stack.addStack()
    row.layoutHorizontally()
    const text = row.addText(`- ${r.title}`)
    text.font = Font.systemFont(11)
    text.lineLimit = 1
    row.url = `https://dev.to${r.path}`
  })
  widget.addSpacer()
} else {
  widget.setPadding(0, 0, 0, 0)
  widget.addSpacer(0)

  let firstLineStack = widget.addStack()
  firstLineStack.setPadding(5, 10, 5, 10)
  firstLineStack.backgroundColor = Color.dynamic(new Color('EDEDED', 0.7), new Color('111111', 0.7))
  
  let provider = firstLineStack.addText("Dev.to")
  provider.font = Font.boldSystemFont(12)
  
  // Last Update
  firstLineStack.addSpacer()
  lastUpdateStack = firstLineStack.addStack()
  lastUpdateStack.layoutVertically()
  lastUpdateStack.addSpacer(3)
  let lastUpdateText = lastUpdateStack.addDate(lastUpdate)
  lastUpdateText.font = Font.systemFont(8)
  lastUpdateText.rightAlignText()
  lastUpdateText.applyTimeStyle()
  widget.addSpacer()
  
  const article = result[0]
  const imageReq = new Request(article.main_image)
  widget.backgroundImage = (await imageReq.loadImage())
  
  const stack = widget.addStack()
  stack.setPadding(10, 10, 10, 10)
  stack.backgroundColor = Color.dynamic(new Color('EDEDED', 0.7), new Color('111111', 0.7))
  
  const text = stack.addText(article.title)
  text.font = Font.boldSystemFont(12)
  widget.url = `https://dev.to${article.path}`
  widget.addSpacer(0)
}



if (!config.runsInWidget) {
  switch (config.widgetFamily) {
    case 'small': await widget.presentSmall(); break;
    case 'medium': await widget.presentMedium(); break;
    case 'large': await widget.presentLarge(); break;
  }
} else {
  Script.setWidget(widget)
}
Script.complete()