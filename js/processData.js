    var url = "https://www.sfu.ca/~jdlim/iat355/ks-projects-parsed.csv";

    var width = 1000;
    var height = 500;
    var margin = 100;

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

         console.log(projectCount)
      var nameArray = new Array();
      for (i = 0; i < projectCount.length; i++) {
        nameArray.push(projectCount[i]["key"]);
      }

      /* 	var countName =  */
      for (i = 0; i < nameArray.length; i++) {
        nameArray[i];
      }

      //error check
      if (error) console.log("Error: data not loaded!");

//change type of data if incorrect
      data.forEach(function(d) {
        d.main_category = d.main_category;
        d.goal = +d.goal;
        d.pledged = +d.pledged;
      });

      // if (d.state == "successful" && (d.main_category.startsWith("Design")) && (d.launched.startsWith("2016"))) {
      //   success++;
      // }
var maxNumberProject=d3.max(projectCount, function (d){
var  total=0;
var total2=0;
//TODO: remember to
  for (var i = 0; i < d.values.length; i++) {
    if (d.values[i].key == "failed") total2 = total2 + d.values[i].value;

    if (d.values[i].key == "successful") total = total + d.values[i].value;
  }

  return (total + total2);

});
  //   var maxNumberProject = d3.sum( catValueArray);
      console.log(maxNumberProject);

      //define color scale
      var colorScale =
        d3.scaleLinear()
        .domain([0, 15])
        .range(["red", "blue"]);

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
        .attr("width", "1200");

      //append x axis to svg
      svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        // .append("text")
        .attr("y", 30)
        .attr("x", 650)
        .attr("dy", "0.5em")

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
          (height + margin) + ")")
        .style("text-anchor", "middle")
        .text("# of Project Per Category");


      //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      var bar = svg.selectAll("x")
        .data(projectCount)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .style('fill', function(d) {
          return colorScale(255);
        })
        .attr("x", margin)
        .attr("y", function(d) {
          return y(d.key);
        })
        .attr("height", y.bandwidth())
        .transition()
      //  .delay(0)
        .duration(1200)
        .attr("width", function(d) {
          var total = 0;
          for (var i = 0; i < d.values.length; i++) {
            if (d.values[i].key == "successful") total = total + d.values[i].value;
          }
//          console.log(total);
      //    return total * 0.6;
      return x(total)-margin;
        });

      var bar2 = svg.selectAll("bar2")
        .data(projectCount)
        .enter()
        .append("rect")
        .attr("class", "bar2")
        .style('fill', function(d) {
          return colorScale(1);
        })
        .attr("x", function(d) {
          var total = 0;
          for (var i = 0; i < d.values.length; i++) {
            if (d.values[i].key == "successful") total = total + d.values[i].value;
          }
          console.log(" x total is "+ total+"  after salec "+x(total));
              //  if ((x(total)-margin)<0)
              //  return margin-x(total);
        //  return total * 0.6 + margin;
          return x(total);
        })

        .attr("y", function(d) {
          return y(d.key);
        })
        .attr("height", y.bandwidth())
        .transition()
      //  .delay(1200)
        .duration(1200)
        .attr("width", function(d) {
          var total = 0;
          console.log(d)
          for (var i = 0; i < d.values.length; i++) {

            if (d.values[i].key == "failed") total = total + d.values[i].value;
          }
         console.log(" total is "+ total+"  after salec "+x(total));
        //  return total * 0.6;
          return x(total)-margin;
        });


    //   var bar3 = svg.selectAll("bar3")
    //     .data(projectCount)
    //     .enter()
    //     .append("rect")
    //     .attr("class", "bar3")
    //     // .style('fill',function(d,i){ return colorScale(i); })
    //     .style('fill', function(d) {
    //       // console.log(d.values);
    //       // for (var i = 0;i < d.values.length;i++) {
    //       // 	total = total + d.values[i].value;
    //       // 	console.log(d.values[i].value);
    //       // }
    //       // if (d.values[0].key == "failed") return colorScale(1);
    //       // else if (d.values[0].key == "successful") return colorScale(255);
    //       return colorScale(410);
    //     })
    //     .attr("x", function(d) {
    //       var total = 0;
    //       for (var i = 0; i < d.values.length; i++) {
    //         if (d.values[i].key == "successful" || d.values[i].key == "failed") total = total + d.values[i].value;
    //       }
    //       return total * 0.6 + margin;
    //     })
    //     .attr("y", function(d) {
    //       return y(d.key);
    //     })
    //     .attr("height", y.bandwidth())
    //     .transition()
    //     .duration(1200)
    //     .attr("width", function(d) {
    //       // console.log("best");
    //       //console.log(d.values);
    //       var total = 0;
    //       for (var i = 0; i < d.values.length; i++) {
    //         if (d.values[i].key == "canceled") total = total + d.values[i].value;
    //       }
    //       return total * 0.6;
    //     });
     });
