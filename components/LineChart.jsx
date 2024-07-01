import { List, ListItem, useColorMode } from "@chakra-ui/react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  LineChart as ReactChartLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const CustomLegend = ({
  focusRef = {
    current: null,
  },
  payload,
  onClick = () => {},
  onMouseEnter = () => {},
  onMouseLeave = () => {},
  onFocus = () => {},
  onBlue = () => {},
}) => {
  return (
    <List
      className="line-chart-legend"
      css={{
        listStyleType: "none",
        display: "flex",
        gap: "8px",
        li: {
          display: "flex",
          gap: "4px",
          alignItems: "center",
          userSelect: "none",
          transition: " 0.3s",
          flexWrap: "wrap",
          "&:hover": {
            cursor: "pointer",
          },
          "&.hidden": {
            opacity: "0.3",
          },
        },
      }}
    >
      {payload.map((e, index) => (
        <ListItem
          className={e.inactive ? "hidden" : ""}
          key={`item-${index}-${e.value}`}
          style={{ color: e.color }}
          onClick={() => {
            onClick(e);
          }}
          onMouseEnter={() => {
            onMouseEnter(e);
          }}
          onMouseLeave={() => {
            onMouseLeave(e);
          }}
          onFocus={() => {
            focusRef.current = e;
            onFocus(e);
          }}
          onBlur={() => {
            focusRef.current = null;
            onBlue(e);
          }}
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              return onClick(e);
            }
            if (event.key === " ") {
              event.preventDefault();
              return onClick(e);
            }
          }}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              backgroundColor: e.color,
              borderRadius: "50%",
            }}
          ></span>
          {e.value}
        </ListItem>
      ))}
    </List>
  );
};

/**
 *
 * @param {{
 *  height?:string;
 *  title?:string;
 *  data:any[];
 *  series:import("recharts").LineProps[];
 *  yAxis?: import("recharts").YAxisProps;
 *  xAxis: import("recharts").XAxisProps;
 *  grid?: import("recharts").CartesianGridProps;
 *  tooltipContent?: (props:{active:boolean;payload:{value:any}[], label:any})=>{};
 *  tooltipLabelFormatter?: (label:any)=>{};
 *  tooltipContentStyle?: import("react").CSSProperties;
 *  margin?: {
 *    top:number;
 *    right:number;
 *    bottom:number;
 *    left:number;
 *  };
 *  showLegend?:boolean;
 *  showGrid?:boolean;
 *  isLoading?:boolean;
 *  autoYDomain?:boolean;
 * }} param0
 * @returns
 */
const LineChart = ({
  height = "300px",
  title = "",
  data = [],
  series = [],
  yAxis = {},
  xAxis = {},
  grid = {},
  showLegend = true,
  showGrid = true,
  children,
  tooltipContent,
  tooltipLabelFormatter,
  tooltipContentStyle,
  isLoading = false,
  autoYDomain = true,
  margin,
}) => {
  const mode = useColorMode();
  const [_series, setSeries] = useState(series);
  const [_seriesDefault, setSeriesDefault] = useState(series);
  const focusRef = useRef(null);

  useEffect(() => {
    setSeries(series);
    setSeriesDefault(series);
  }, [series, setSeries, setSeriesDefault]);

  const _tooltipContentStyle = useMemo(() => {
    if (tooltipContentStyle) {
      return tooltipContentStyle;
    }

    return {
      backgroundColor:
        mode.colorMode === "dark"
          ? "rgba(120,120,120,0.3)"
          : "rgba(255,255,255,0.6)",
      border: "none",
      borderRadius: "8px",
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      lineHeight: "14px",
    };
  }, [tooltipContentStyle, mode.colorMode]);

  const domain = useMemo(() => {
    if (!autoYDomain) {
      // this is default of rechart, but is actually buggy
      return ["auto", "auto"];
    }

    const max = Math.max(
      ...data
        .map((e) => {
          const arr = [];
          for (let key in e) {
            if (key === xAxis.dataKey) {
              continue;
            }
            arr.push(parseFloat(e[key]));
          }
          return arr;
        })
        .flat()
    );

    return [0, parseInt(Math.ceil(max * 1.2))];
  }, [data, autoYDomain]);

  return (
    <div style={{ height }}>
      <div
        style={{
          color: mode.colorMode === "dark" ? "#FFFFFF" : "#121212",
          marginBottom: "12px",
          fontSize: "16px",
        }}
      >
        {title}
      </div>
      {isLoading ? (
        ""
      ) : data.length == 0 ? (
        <></>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <ReactChartLineChart
            width={500}
            height={300}
            data={data}
            margin={margin}
          >
            {showGrid && <CartesianGrid {...grid} />}

            <XAxis {...xAxis} />
            <YAxis domain={domain} {...yAxis} />
            <Tooltip
              content={tooltipContent}
              labelFormatter={tooltipLabelFormatter}
              contentStyle={_tooltipContentStyle}
            />
            <Legend
              content={
                showLegend ? (
                  <CustomLegend
                    focusRef={focusRef}
                    onClick={({ dataKey }) => {
                      setSeries((current) => {
                        // react dev tool will cause this to be triggered twice. In pro build, this will work fine
                        const target = current.find(
                          (e) => e.dataKey === dataKey
                        );
                        target.hide = target.hide === true ? false : true;
                        current.forEach((e) => {
                          e.strokeOpacity = 1;
                        });
                        return [...current];
                      });
                    }}
                    onMouseEnter={({ dataKey }) => {
                      // if (inactive && !focusRef.current) return;
                      setSeries((current) => {
                        current.forEach((e) => {
                          if (e.dataKey === dataKey)
                            return (e.strokeOpacity = 1);
                          e.strokeOpacity = 0.3;
                        });
                        return [...current];
                      });
                    }}
                    onFocus={({ inactive, dataKey }) => {
                      if (inactive) return;
                      setSeries((current) => {
                        current.forEach((e) => {
                          if (e.dataKey === dataKey)
                            return (e.strokeOpacity = 1);
                          e.strokeOpacity = 0.3;
                        });
                        return [...current];
                      });
                    }}
                    onMouseLeave={() => {
                      setSeries((current) => {
                        current.forEach((e) => {
                          e.strokeOpacity = 1;
                        });
                        return [...current];
                      });

                      if (focusRef.current)
                        setSeries((current) => {
                          current.forEach((e) => {
                            if (e.dataKey === focusRef.current?.value)
                              return (e.strokeOpacity = 1);
                            e.strokeOpacity = 0.3;
                          });
                          return [...current];
                        });
                    }}
                    onBlue={() => {
                      setSeries((current) => {
                        current.forEach((e) => {
                          e.strokeOpacity = 1;
                        });
                        return [...current];
                      });
                    }}
                  />
                ) : (
                  <div style={{ height: "24px" }}></div>
                )
              }
              wrapperStyle={{
                left: "0px",
              }}
            />
            {_series.map((props) => (
              <Line
                key={"line-series-" + props.dataKey + props.id}
                {...props}
              />
            ))}
            {children}
          </ReactChartLineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default LineChart;
