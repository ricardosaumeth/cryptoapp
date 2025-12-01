import Highcharts from "highcharts/highstock"
import Palette from "./style"

const theme = {
  colors: [
    "#2b908f",
    "#90ee7e",
    "#f45b5b",
    "#7798BF",
    "#aaeeee",
    "#ff0066",
    "#eeaaee",
    "#55BF3B",
    "#DF5353",
    "#7798BF",
    "#aaeeee",
  ],
  chart: {
    backgroundColor: {
      stops: [
        [0, "#2a2a2b"],
        [1, "#3e3e40"],
      ],
    },
    style: {
      color: Palette.White,
      fontFamily: "FiraSans-MediumItalic",
      fontSize: "14px",
    },
  },
  xAxis: {
    labels: {
      style: {
        color: "#E0E0E3",
      },
    },
    lineColor: "#707073",
    minorGridLineColor: "#505053",
    tickColor: "#707073",
    title: {
      style: {
        color: "#A0A0A3",
      },
    },
  },
  yAxis: {
    gridLineColor: Palette.Border,
    labels: {
      style: {
        color: "#E0E0E3",
      },
    },
    lineColor: "#707073",
    minorGridLineColor: "#505053",
    tickColor: "#707073",
    tickWidth: 1,
    title: {
      style: {
        color: "#A0A0A3",
      },
    },
  },
  tooltip: {
    borderColor: Palette.Border,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    style: {
      color: Palette.White,
    },
  },
  plotOptions: {
    series: {
      dataLabels: {
        color: "#F0F0F3",
        style: {
          fontSize: "13px",
        },
      },
      marker: {
        lineColor: "#333",
      },
    },
    boxplot: {
      fillColor: "#505053",
    },
    candlestick: {
      lineColor: "white",
    },
    errorbar: {
      color: "white",
    },
  },
  legend: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    itemStyle: {
      color: "#E0E0E3",
    },
    itemHoverStyle: {
      color: "#FFF",
    },
    itemHiddenStyle: {
      color: "#606063",
    },
    title: {
      style: {
        color: "#C0C0C0",
      },
    },
  },
  credits: {
    style: {
      color: "#666",
    },
  },
  labels: {
    style: {
      color: "#707073",
    },
  },
  drilldown: {
    activeAxisLabelStyle: {
      color: "#F0F0F3",
    },
    activeDataLabelStyle: {
      color: "#F0F0F3",
    },
  },
  navigation: {
    buttonOptions: {
      symbolStroke: "#DDDDDD",
      theme: {
        fill: "#505053",
      },
    },
  },
  accessibility: {
    enabled: false,
  },
  // scroll charts
  rangeSelector: {
    enabled: true,
    selected: 2,
    buttons: [
      {
        type: "minute",
        count: 5,
        text: "5m",
      },
      {
        type: "minute",
        count: 15,
        text: "15m",
      },
      {
        type: "minute",
        count: 30,
        text: "30m",
      },
      {
        type: "hour",
        count: 1,
        text: "1h",
      },
      {
        type: "all",
        text: "All",
      },
    ],
    buttonTheme: {
      fill: "#2c3e50",
      stroke: "#000000",
      style: {
        color: "#CCC",
      },
      states: {
        hover: {
          fill: "rgba(50, 120, 255, 0.15)",
          stroke: "#000000",
          style: {
            color: "white",
          },
        },
        select: {
          fill: "#4682b4",
          stroke: "#000000",
          style: {
            color: "white",
          },
        },
      },
    },
    inputBoxBorderColor: "#505053",
    inputStyle: {
      backgroundColor: "#333",
      color: "silver",
    },
    labelStyle: {
      color: "silver",
    },
  },
  navigator: {
    enabled: true,
    xAxis: {
      gridLineColor: "#505053",
      labels: {
        style: {
          color: "white",
        },
      },
    },
    handles: {
      backgroundColor: "#666",
      borderColor: "#AAA",
    },
    outlineColor: "#CCC",
    maskFill: "rgba(255,255,255,0.1)",
    series: {
      color: "#7798BF",
      lineColor: "#A6C7ED",
    },
  },
  scrollbar: {
    barBackgroundColor: "#808083",
    barBorderColor: "#808083",
    buttonArrowColor: "#CCC",
    buttonBackgroundColor: "#606063",
    buttonBorderColor: "#606063",
    rifleColor: "#FFF",
    trackBackgroundColor: "#404043",
    trackBorderColor: "#404043",
  },
}

Highcharts.setOptions(theme as unknown as Highcharts.Options)
