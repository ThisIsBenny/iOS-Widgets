# Apple Store Order Status
![Apple Store Order Status Widget Preview light](https://raw.githubusercontent.com/ThisIsBenny/iOS-Widgets/main/Apple-Order-Status/previewLight.jpeg)

This widget shows you the status of your Apple Store order. It shows the remaining days until delivery, the product name, product image, order date and delivery date.

[[Download]](https://raw.githubusercontent.com/ThisIsBenny/iOS-Widgets/main/Apple-Order-Status/Apple-Store-Order-Status.js)

## Setup
Set the Order-Number and your E-Mail Adress, separated by `;` to the Widget Parameter (Third field in the widget settings).

Example: `W1234567;jon@snow.com`

### Optional

#### Item
If you have more than one item in your order, you can use the third parameter to specify which item should be displayed (default: 1).

Example: Example: `W1234567;jon@snow.com;2`

#### Dark Mode
If you like to use the Dark Mode or Auto Mode, you can change in the Script the display mode in 'EDIT ME' - section: 

```javascript
//////////////////// - EDIT ME - ///////////////////////////

/// Display mode
///
/// - DisplayMode.LIGHT: Light mode
/// - DisplayMode.DARK: Dark mode
/// - DisplayMode.AUTO: Follow system settings

const displayMode = DisplayMode.LIGHT
```

## Contributors
- [florentmorin](https://github.com/florentmorin)
