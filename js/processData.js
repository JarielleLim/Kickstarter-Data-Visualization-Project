    var url = "https://www.sfu.ca/~jdlim/iat355/ks-projects-parsed.csv";


    //load in data from online source
    d3.csv(url, function(error, data) {

      //count number of projects in each main category in each in nest
      var mainCatCount = d3.nest()
        .key(function(d) {
          return d.main_category;
        })
        .rollup(function(v) {
          return v.length;
        })
        .entries(data);

      console.log(mainCatCount);

      //pushing "key" from d3 nest into an array
      //create array to hold category names
      var catArray = new Array();
      for (i = 0; i < mainCatCount.length; i++) {
        catArray.push(mainCatCount[i]["key"]);
      }

      console.log("category names:" + catArray);


      //pushing "value" from d3 nest into an array
      var catValueArray = new Array();
      for (i = 0; i < mainCatCount.length; i++) {
        catValueArray.push(mainCatCount[i]["value"]);
      }

      //create nest for project count in main category, and the state (successful, failed)
      var projectCount = d3.nest()
        .key(function(d) {
          return d.main_category;
        })
        .key(function(d) {
          return d.state;
        })
        .rollup(function(v) {
          return v.length;
        })
        .entries(data);


      console.log(projectCount);
      //error check
      if (error) console.log("Error: data not loaded!");

      //change type of data if needed (for later)
      data.forEach(function(d) {
        d.main_category = d.main_category;
        d.goal = +d.goal;
        d.pledged = +d.pledged;
      });

      var maxNumberProject = d3.max(catValueArray);
            var margin = 100;
      var width = window.innerWidth;
      var height = window.innerHeight;
var padding = 50;
      var widthGraph = window.innerWidth + padding + padding;
      var heightGraph = window.innerHeight + padding + padding;


      //define color scale
      var colorScale =
        d3.scaleLinear()
        .domain([0, 15])
        .range(["rgb(143, 226, 133)", "rgb(186, 42, 85)"]);

      //define scales
      let x = d3.scaleLinear(),
        y = d3.scaleBand().rangeRound([height, 0]).padding(0.2);

      x.domain([0, maxNumberProject])
        .range([margin, width]);

      y.domain(catArray)
        .range([height, 10]);

      // Define the div for the tooltip
      var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);



      // var svg = d3.select("body")
      //   .append("svg")
      //   .attr("height", "1000")
      //   .attr("width", "1200")
      //   .attr("transform", "translate(100,0)");
        var svg = d3.select("div#chartId")
          .append("div")
          .classed("svg-container", true) //container class to make it responsive
          .append("svg")
          //responsive SVG needs these 2 attributes and no width and height attr
          .attr("preserveAspectRatio", "xMinYMin meet")
          .attr("viewBox","0 0 " + widthGraph + " " + heightGraph)
          //class to make it responsive
          .classed("svg-content-responsive", true)
          //.attr("transform", "translate(-100,0)");

      //create bar (length based on successes in each category)
      var bar = svg.selectAll("x")
        .data(projectCount)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .style('fill', function(d) {
          return colorScale(1);
        })
        .attr("x", margin)
        .attr("y", function(d) {
          return y(d.key);
        })
        .attr("height", y.bandwidth())

        //add tool-tip function to show value when hover
        .on("mouseover", function(d) {
          div.transition()
            .duration(200)
            .style("opacity", .9);
          div.text(d.values[1].value)
            .style("left", (d3.event.pageX + d.values.length) + "px")
            .style("top", (d3.event.pageY) + "px");
        })
        .on("mouseout", function(d) {
          div.transition()
            .duration(500)
            .style("opacity", 0);
        })
        .transition()
        .ease(d3.easeLinear)
        .duration(500)
        //calculate width of bar based on success value in each category
        .attr("width", function(d) {
          var totalSuccess = d.values[1].value;
          return x(totalSuccess) - margin
        });


      //create bar (length based on successes in each category)
      var bar2 = svg.selectAll("bar2")
        .data(projectCount)
        .enter()
        .append("rect")
        .attr("class", "bar2")
        .style('fill', function(d) {
          return colorScale(15);
        })
        //calculate width of bar based on success value in each category
        //to find starting position for graph
        .attr("x", function(d) {
          var totalSuccessCheck = d.values[1].value;
          return x(totalSuccessCheck);
        })

        //add tool-tip function to show value when hover
        .on("mouseover", function(d) {
          div.transition()
            .duration(200)
            .style("opacity", .9);
          div.text(d.values[0].value)
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY) + "px");
        })
        .on("mouseout", function(d) {
          div.transition()
            .duration(500)
            .style("opacity", 0);
        })

        .attr("y", function(d) {
          return y(d.key);
        })
        .attr("height", y.bandwidth())
        .transition()
        .delay(500)
        .ease(d3.easeLinear)
        .duration(500)
        //calculate width of bar based on failed value in each category
        .attr("width", function(d) {
          var totalFailed = d.values[0].value
          return x(totalFailed) - margin;
        });

      //append x axis to svg
      svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .attr("y", 30)
        .attr("x", 650)

      //append y axis to svg
      svg.append("g")
        .attr("transform", "translate(100,0)")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y))

      //label for y axis: kickstarter main categories
      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Kickstarter Main Categories");

      //label for x axis: # of Project Per Category
      svg.append("text")
        .attr("transform",
          "translate(" + (width / 2) + " ," +
          (height + margin / 2) + ")")
        .style("text-anchor", "middle")
        .text("# of Projects Per Category");

      //create legend for bar (http://d3-legend.susielu.com)
      var ordinal = d3.scaleOrdinal()
        .domain(["success", "failure"])
        .range(["rgb(143, 226, 133)", "rgb(186, 42, 85)"]);

      var svg = d3.select("svg");

      svg.append("g")
        .attr("class", "legendOrdinal")
        .attr("transform", "translate(" + (width - 70) + " ,50)");

      var legendOrdinal = d3.legendColor()
        .shape("path", d3.symbol().type(d3.symbolSquare).size(200)())
        .shapePadding(10)
        .scale(ordinal);

      svg.select(".legendOrdinal")
        .call(legendOrdinal);
    });

    // SOURCES
    //   tool-tips
    //     https://bl.ocks.org/ayala-usma/d2f3b89c84e4ed66e22d02affcdcab73
    //   d3.nest
    //     https://bl.ocks.org/ProQuestionAsker/60e7a6e3117f9f433ef9c998f6c776b6
    //     https://stackoverflow.com/questions/27347617/how-to-use-nest-and-rollup-functions-in-d3-to-create-a-bar-chart
    //   accessing nested data
    //     https://stackoverflow.com/questions/11922383/access-process-nested-objects-arrays-or-json
    //   legend
    //     http://d3-legend.susielu.com
