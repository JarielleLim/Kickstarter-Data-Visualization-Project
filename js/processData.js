    var url = "https://www.sfu.ca/~jdlim/iat355/ks-projects-parsed.csv";



    //load in data from online source
    d3.csv(url, function(error, data) {

      // var success = 0;

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

      // //for loop to go through category array
      // for (i = 0; i < catValueArray.length; i++) {
      //   console.log(catValueArray[i]);
      // }

      //create nest for project count
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

      //error check
      if (error) console.log("Error: data not loaded!");

      //change type of data if incorrect
      data.forEach(function(d) {
        d.main_category = d.main_category;
        d.goal = +d.goal;
        d.pledged = +d.pledged;
      });

      var maxNumberProject = d3.max(catValueArray);

      var width = 1000;
      var height = 500;
      var margin = 100;
      console.log(maxNumberProject);

      //define color scale
      var colorScale =
        d3.scaleLinear()
        .domain([0, 15])
        .range([ "rgb(85, 178, 96)", "rgb(50, 50, 50)"]);

      //define scales
      let x = d3.scaleLinear(),
        y = d3.scaleBand().rangeRound([height, 0]).padding(0.2);

      x.domain([0, maxNumberProject])
        .range([margin, width]);

      y.domain(catArray)
        .range([height, 10]);

      var svg = d3.select("body")
        .append("svg")
        .attr("height", "1000")
        .attr("width", "1200")
        .attr("transform", "translate(100,0)");

      //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
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
        .transition()
        .duration(1200)
        .attr("width", function(d) {
            var total = 0;
            for (var i = 0; i < d.values.length; i++) {
              if (d.values[i].key == "successful") total = total + d.values[i].value;
            }
            return x(total) - margin;
          })
          ;

      var bar2 = svg.selectAll("bar2")
        .data(projectCount)
        .enter()
        .append("rect")
        .attr("class", "bar2")
        .style('fill', function(d) {
          return colorScale(15);
        })
        .attr("x", function(d) {
          var total = 0;
          for (var i = 0; i < d.values.length; i++) {
            if (d.values[i].key == "successful") total = total + d.values[i].value;
          }
          return x(total);
        })

        .attr("y", function(d) {
          return y(d.key);
        })
        .attr("height", y.bandwidth())
        .transition()
        .delay(650)
        .ease(d3.easeLinear)
        .duration(1200)
        .attr("width", function(d) {
          var total = 0;
          for (var i = 0; i < d.values.length; i++) {
            if (d.values[i].key == "failed") total = total + d.values[i].value;
          }
          return x(total) - margin;
        })

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


        var ordinal = d3.scaleOrdinal()
  .domain(["success", "failure"])
  .range([ "rgb(85, 178, 96)", "rgb(50, 50, 50)"]);

var svg = d3.select("svg");

svg.append("g")
  .attr("class", "legendOrdinal")
  .attr("transform", "translate(" + (width-70) + " ,50)");

var legendOrdinal = d3.legendColor()
  .shape("path", d3.symbol().type(d3.symbolSquare).size(200)())
  .shapePadding(10)
  .scale(ordinal);

svg.select(".legendOrdinal")
  .call(legendOrdinal);
    });
