var margin = {top: 20, right: 30, bottom: 50, left: 90},
    width =  1000- margin.left - margin.right,
    height = 750 - margin.top - margin.bottom;

// append the svg object to the body of the page

var svg = d3.select("body")
  .append("svg")
  .style("background-color", "white")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")")
          ;

// Parse the Data
d3.csv("Country_2.csv", function(error, data) {
    if (error) throw error;
  
    // Convert year columns to numbers dynamically (for y_1790 to y_2010)
    data.forEach(function(d) {
      Object.keys(d).forEach(function(key) {
        if (key.startsWith('y_')) {
          d[key] = +d[key]; // Convert to number
        }
      });
    });
  
    // X axis
    var x = d3.scaleLinear()
      .domain([0, 40000000])  // Use your custom domain
      .range([0, width]);
  
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");
  
    // Y axis
    var y = d3.scaleBand()
      .range([0, height])
      .domain(data.map(function(d) { return d.Country; }))
      .padding(.1);

    var yAxis = svg.append("g").call(d3.axisLeft(y));
    
    // Create bars
    var bars = svg.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", x(0))
      .attr("y", function(d) { return y(d.Country); })
      .attr("width", function(d) { return x(d.y_1790); })  // Initialize with y_1790
      .attr("height", y.bandwidth())
      .attr("fill", "skyblue");
  
    
  
    // Append text labels directly to bars
    var labels = svg.append("g")
      .attr("fill", "white")
      .attr("text-anchor", "start")  // Align text to the start (right end of the bar)
      .selectAll("text")
      .data(data)
      .enter()
      .append("text")
      .attr("x", function(d) { return x(d.y_1790); })  // Set initial position at the end of the bar
      .attr("y", function(d) { return y(d.Country) + y.bandwidth() / 2; })
      .attr("dy", "0.35em")  // Vertical alignment for the text
      .attr("dx", 4)  // Offset text to the right
      .text(function(d) { return formatComma(d.y_1790); })  // Display the initial total with commas
      .style("font-size", "9px")  // Set font size to 9px
      .style("font-family", "sans-serif")  // Use a similar font family to the x-axis
      .style("fill", "black");  // Set label color to black
    // Format function for adding commas using toLocaleString
    function formatComma(value) {
        return value.toLocaleString();  // Localized formatting with commas
      }
  
    // Array of years for the animation cycle
    let years = [
      'y_1790', 'y_1800', 'y_1810', 'y_1820', 'y_1830', 'y_1840', 'y_1850', 'y_1860', 'y_1870',
      'y_1880', 'y_1890', 'y_1900', 'y_1910', 'y_1920', 'y_1930', 'y_1940', 'y_1950', 'y_1960',
      'y_1970', 'y_1980', 'y_1990', 'y_2000', 'y_2010'
    ];
  
    let currentIndex = 0;


    function animateYears() {
      let startYear = years[currentIndex];
      let endYear = years[(currentIndex + 1) % years.length]; // Loop back to start

      // Sort the data based on the population for the current year
      data.sort(function(a, b) {
          return b[startYear] - a[startYear];  // Sort in descending order
      });
        // Update the Y axis domain based on the sorted data
      y.domain(data.map(function(d) { return d.Country; }));
      // Update the Y axis
      yAxis.transition()
      .duration(1000)
      .call(d3.axisLeft(y));

      //Transition labels for the totals at the end of the bars
      labels.data(data)
        .transition(1)
        .duration(1000)  // Same duration as bars
        .ease(d3.easeCubicInOut)  // Same easing as bars
        .attr("x", function(d) {
          return x(d[endYear]);  // Move label to the new end of the bar
        })
        .text(function(d) {
          return formatComma(d[endYear]);  // Update text to show the new total with commas
        })
        .style("font-size", "9px")  // Ensure label font size is 9px
        .style("font-family", "sans-serif")  // Match font family
        .style("fill", "black");  // Ensure text color is visible

      //Transition bars for the current year
      bars.transition()
        .duration(1000)  // 1-second duration per year
        .ease(d3.easeCubicInOut)  // Smoother easing
                    .attr("y", function(d) { return y(d.Country); })
        .attr("width", function(d) {
          return x(d[endYear]);  // Set width according to the current year
        })
                     .attr("height", y.bandwidth());
      
  
      // Move to the next year
      currentIndex = (currentIndex + 1) % years.length;
  
      // Repeat the animation after 1 second
      setTimeout(animateYears, 1000);
    }
  
    animateYears(); // Start the animation cycle
});