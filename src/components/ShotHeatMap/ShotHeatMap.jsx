import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { hexbin as d3Hexbin } from "d3-hexbin";

const width = 750;
const height = 750;

// NBA halfcourt dimensions for plotting (feet to pixels conversion is approximate)
const courtXmin = -250, courtXmax = 250, courtYmin = -47.5, courtYmax = 422.5;

const xScale = d3.scaleLinear()
  .domain([courtXmin, courtXmax])
  .range([0, width]);

const yScale = d3.scaleLinear()
  .domain([courtYmin, courtYmax])
  .range([height, 0]);

function getEfficiency(bin) {
  const made = bin.filter(d => d.SHOT_MADE_FLAG === 1).length;
  return made / bin.length;
}

export default function ShotHexbinChart({ playerId }) {
  const svgRef = useRef();
  const [shots, setShots] = useState([]);
  
  useEffect(() => {
    fetch(`http://localhost:5000/api/players/shots/${playerId}`)
      .then(res => res.json())
      .then(data => setShots(data));
  }, [playerId]);

  useEffect(() => {
    // Clear previous renders
    d3.select(svgRef.current).selectAll("*").remove();

    // Hexbin setup
    const hexbin = d3Hexbin()
      .x(d => xScale(d.LOC_X))
      .y(d => yScale(d.LOC_Y))
      .radius(18)
      .extent([[0, 0], [width, height]]);

    const bins = hexbin(shots);

    // Color scale for efficiency
    const minEff = 0, maxEff = 1;
    const colorScale = d3.scaleLinear()
      .domain([minEff, 0.5, maxEff])
      .range(["#4575b4", "#fee08b", "#d73027"]); // blue-yellow-red

    // Size scale for frequency
    const maxBinSize = d3.max(bins, d => d.length) || 1;
    const sizeScale = d3.scaleLinear()
      .domain([1, maxBinSize])
      .range([8, 22]); // min/max hex radius

    // Draw SVG
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    // Draw court outline (simple version)
    svg.append("rect")
      .attr("x", xScale(-250))
      .attr("y", yScale(422.5))
      .attr("width", xScale(250) - xScale(-250))
      .attr("height", yScale(-47.5) - yScale(422.5))
      .attr("fill", "#fff")
      .attr("stroke", "#bbb");

    // Draw the arc for the 3pt line
    svg.append("path")
      .attr("d", d3.arc()({
        innerRadius: xScale(0) - xScale(237.5),
        outerRadius: xScale(0) - xScale(237.5),
        startAngle: Math.PI * 0.1,
        endAngle: Math.PI * 0.9
      }))
      .attr("transform", `translate(${xScale(0)},${yScale(0)})`)
      .attr("stroke", "#bbb")
      .attr("fill", "none");

    // Draw hexagons
    svg.append("g")
      .selectAll("path")
      .data(bins)
      .enter().append("path")
      .attr("d", d => hexbin.hexagon(sizeScale(d.length)))
      .attr("transform", d => `translate(${d.x},${d.y})`)
      .attr("fill", d => colorScale(getEfficiency(d)))
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .attr("opacity", 0.8);

    // Add title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .attr("font-size", "28px")
      .attr("font-family", "sans-serif")
      .text("LEBRON JAMES 2013-14");

    // Add legends (optional, can be improved)
    svg.append("text")
      .attr("x", 20)
      .attr("y", height - 20)
      .attr("font-size", "12px")
      .text("Frequency: smaller = less shots, larger = more shots");

    svg.append("text")
      .attr("x", width - 200)
      .attr("y", height - 20)
      .attr("font-size", "12px")
      .text("Efficiency: blue = low, red = high");

  }, [shots]);

  return (
    <svg ref={svgRef}></svg>
  );
}