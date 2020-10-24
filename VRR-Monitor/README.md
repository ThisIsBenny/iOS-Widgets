# VRR-Monitor
![VRR-Monitor Widget Preview light](https://raw.githubusercontent.com/ThisIsBenny/iOS-Widgets/main/VRR-Monitor/previewLight.jpeg)
![VRR-Monitor Widget Preview dark](https://raw.githubusercontent.com/ThisIsBenny/iOS-Widgets/main/VRR-Monitor/previewDark.jpeg)

This widget displays the departure times of a selected station. The data for this is provided by the Verkehrsverbund Rhein-Ruhr (VRR), which is why only stations within the VRR are supported.

[[Download]](https://raw.githubusercontent.com/ThisIsBenny/iOS-Widgets/main/VRR-Monitor/VRR-Monitor.js)

## Setup
A Station-ID is required to set up the widget. To get the Station-ID, you can run the Script directly in the Scriptable App to use the Setup Wizard.
The wizard searches for stations near to you (this requires your location).

Add the generated config to the Widget Parameter like this:

![VRR-Monitor Widget setup](https://raw.githubusercontent.com/ThisIsBenny/iOS-Widgets/main/VRR-Monitor/setup.jpeg)

### Alternativ
The Station-ID can be searched with this URL: 
`https://abfahrtsmonitor.vrr.de/backend/api/stations/search?query=`

Put the name of the station behind the "query=" in the URL and open the URL in your Browser.
Example: `https://abfahrtsmonitor.vrr.de/backend/api/stations/search?query=Düsseldorf HBF`

Add the Station-ID and the needed Walking Minutes to the Station, separated by a ";", to the Widget Parameter.