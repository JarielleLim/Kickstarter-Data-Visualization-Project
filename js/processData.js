    var url = "https://www.sfu.ca/~jdlim/iat355/ks-projects-parsed.csv";


    //load in data from online source
    d3.csv(url, function(error, data) {
//var margin = 100;
      var margin = {top: 20, right: 20, bottom: 40, left: 100};
      var padding = 50;

      var width = 800;
      var height = 500;

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


      //Parse differet month
      var monthParse = d3.nest()

        .key(function(d) {
          return d.launched.split("-")[1];
        })

        .rollup(function(v) {
          return v.length;
        })
        .entries(data);

				console.log(monthParse);




				var months = new Array();
				for(i = 0; i < monthParse.length; i++){
					months.push(monthParse[i]["key"]);
				}

				sortMonths = months.sort();

			console.log(sortMonths);

			var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
			console.log(monthNames[parseInt(sortMonths[0])-1]);





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

      var projectPerMonth = d3.nest()
        .key(function(d) {
          return d.main_category;
        })

        .key(function(d) {
          return d.launched.split("-")[1];
        })

        .key(function(d) {
          return d.state;
        })

        .rollup(function(v) {
          return v.length;
        })
        .entries(data);


//         var test = d3.nest()
//           .key(function(d) {
//             return d.main_category;
//           })
//           .key(function(d) {
//             return d.state;
//           })
//
//           .key(function(d) {
//             return d.state;
//           }).length
//
//           .rollup(function(v) { return d3.sum(v, function(d) { return d.state; }); })
// .object(statel);
//
//                     // ,
//                     //
//                     // JP_Sales : d3.sum(v, function (d) {
//                     //     return d["JP_Sales"];
//                     // }),
//                     //
//                     // NA_Sales : d3.sum(v, function (d) {
//                     //     return d["NA_Sales"];
//                     // }),
//                     // Other_Sales : d3.sum(v, function (d) {
//                     //     return d["Other_Sales"];
//                     // }),
//                     // Global_Sales : d3.sum(v, function (d) {
//                     //     return d["Global_Sales"];
//                     // })
//
//           //       };
//           // })
//           //.entries(data);
//
//           console.log(statel);

/*
	   var line = d3.svg.line()
	   	.xScale2(monthNames)
	   	.yScale2(projectCountMax)
	   	.interpolate("linear")
	   	;
*/



      //change type of data if needed (for later)
      data.forEach(function(d) {
        d.main_category = d.main_category;
        d.goal = +d.goal;
        d.pledged = +d.pledged;
      });

      var maxNumberProject = d3.max(catValueArray);

      // var width = window.innerWidth;
      // var height = window.innerHeight;
      //
      // var widthGraph = window.innerWidth + padding + padding;
      // var heightGraph = window.innerHeight + padding + padding;


      //define color scale
      var colorScale =
        d3.scaleLinear()
        .domain([0, 15])
        .range(["rgb(143, 226, 133)", "rgb(186, 42, 85)"]);


function graph1(){

      //define scales
      let xScale = d3.scaleLinear(),
        yScale = d3.scaleBand().rangeRound([height, 0]).padding(0.2);

      xScale.domain([0, maxNumberProject])
        .range([margin.left, width]);

      yScale.domain(catArray)
        .range([height, 10]);

      // Define the div for the tooltip
      var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

      // //append div for graph

      // var svg = d3.select("#chartId")
      //  .append("svg")
      //  .attr("height", height + padding + margin)
      //  .attr("width", width)
      //  .attr("transform", "translate(100,0)");

      var svg = d3.select("div#chartId")
        .append("div")
        .classed("svg-container", true) //container class to make it responsive
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        //.attr("viewBox", "0 0 " + (width) + " " + (height))
        .attr("viewBox", "0 0 1000 1200")
        //class to make it responsive
        .classed("svg-content-responsive", true);


      //create bar (length based on successes in each category)
      var bar = svg.selectAll("x")
        .data(projectCount)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .style('fill', function(d) {
          return colorScale(1);
        })
        .attr("x", margin.left)
        .attr("y", function(d) {
          return yScale(d.key);
        })
        .attr("height", yScale.bandwidth())

        .on("click", function(d) {
          var highlightkey = d.key;
          console.log(d.key)


          graph2(d.key);


					document.getElementById("chartId2").style.display = "block";
          if (highlightkey == "Fashion") {
            console.log("we did it!")
          }

          if (highlightkey == "Technology") {
            console.log("tech time!~")
          }




        })
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
          return xScale(totalSuccess) - margin.left
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
          return xScale(totalSuccessCheck);
        })


        .on("click", function(d) {
          var highlightkey = d.key;
          console.log(d.key)

          if (highlightkey == "Fashion") {
            console.log("we did it!")
            this
          }

          if (highlightkey == "Technology") {
            console.log("tech time!~")
          }



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
          return yScale(d.key);
        })
        .attr("height", yScale.bandwidth())
        .transition()
        .delay(500)
        .ease(d3.easeLinear)
        .duration(500)

        //calculate width of bar based on failed value in each category
        .attr("width", function(d) {
          var totalFailed = d.values[0].value
          return xScale(totalFailed) - margin.left;
        });

      //append x axis to svg
      svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale))
        .attr("y", 30)
        .attr("x", 650)

      //append y axis to svg
      svg.append("g")
        .attr("transform", "translate(100,0)")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale))

      //label for y axis: kickstarter main categories
      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 )
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Kickstarter Main Categories");

      //label for x axis: # of Project Per Category
      svg.append("text")
        .attr("transform",
          "translate(" + (width / 2) + " ," +
          (height + margin.bottom) + ")")
        .style("text-anchor", "middle")
        .text("# of Projects Per Category");

        var sortOrder = false;
        var sortBars = function () {
            sortOrder = !sortOrder;

            sortItems = function (a, b) {
                if (sortOrder) {
                    return a.value- b.value;
                }
                return b.value - a.value;
            };

            svg.selectAll("rect")
                .sort(sortItems)
                .transition()
                .delay(function (d, i) {
                return i * 50;
            })
                .duration(1000)
                .attr("x", function (d, i) {
                return xScale(i);
            });

            svg.selectAll('text')
                .sort(sortItems)
                .transition()
                .delay(function (d, i) {
                return i * 50;
            })
                .duration(1000)
                .text(function (d) {
                return d.value;
            })
                .attr("text-anchor", "middle")
                .attr("x", function (d, i) {
                return xScale(i) + xScale.rangeBand() / 2;
            })
                .attr("y", function (d) {
                return h - yScale(d.value) + 14;
            });
        };
        // Add the onclick callback to the button
        d3.select("#sort").on("click", sortBars);

        // Add the blue line title
        svg.append("text")
        	.attr("x", 0)
        	.attr("y", height + margin.top + 10)
        	.attr("class", "button")
        	.style("fill", "steelblue")
        	.on("click", function(){
        		// Determine if current line is visible
        		var active   = bar.active ? false : true,
        		  newOpacity = active ? 0 : 1;


        		// Hide or show the elements
        		d3.selectAll(".bar").style("opacity", newOpacity);
        		// Update whether or not the elements are active
        		bar.active = active;

            if (active == true){
              bar2.attr("x", 0)
            } else {
              bar2.attr("x", function(d) {
                var totalSuccessCheck = d.values[1].value;
                return xScale(totalSuccessCheck);
              })
            }
        	})
        	.text("Success");

        // Add the red line title
        svg.append("text")
        	.attr("x", 0)
        	.attr("y", height + margin.top + 30)
        	.attr("class", "button")
        	.style("fill", "red")
        	.on("click", function(){
        		// Determine if current line is visible
        		var active   = bar2.active ? false : true ,
        		  newOpacity = active ? 0 : 1;
        		// Hide or show the elements
        		d3.selectAll(".bar2").style("opacity", newOpacity);
        		// Update whether or not the elements are active
        		bar2.active = active;
        	})
        	.text("Failed");


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
    }

//function calling
graph1();


	function graph2(selection){
    var xdim='Critic_Score';
          var   ydim='User_Score';
			//projects that appear within each month
       var projectPerMonth = d3.nest()


			 .key(function(d) {
          return d.main_category == selection;
        })

        .key(function(d) {
          return d.launched.split("-")[1];
        })

        .rollup(function(v) {
          return v.length;
        })
        .entries(data);


				console.log(projectPerMonth);


				var months = new Array();
				for(i = 0; i < monthParse.length; i++){
					months.push(monthParse[i]["key"]);
				}


				//parse out the number of projects that appear per month
			/* 	console.log(projectPerMonth["true"]); */
				var values = new Array();
				for (i = 0; i < projectPerMonth[1]["values"].length; i++) {
					if(projectPerMonth[1]["key"] =="true"){
					values.push(projectPerMonth[1]["values"][i]["value"]);
					}
					else{
						values.push(projectPerMonth[0]["values"][i]["value"]);
					}
				}
				console.log(values);



				//largest number that appears within array
				var projectCountMax = d3.max(values);



				//create nesting for goals
				var catGoal = d3.nest()
					 .key(function(d) {
          return d.main_category == selection;
        })
				.key(function(d) {
          return d.goal;
        })

        .rollup(function(v) {
          return v.length;
        })
        .entries(data);

				console.log(catGoal);



				//create array for category goals
				var catGoalArray = new Array();
				for (i = 0; i < catGoal[1]["values"].length; i++) {
					if(catGoal[1]["key"] =="true"){
					catGoalArray.push(catGoal[1]["values"][i]["key"]);
					}
					else{
						catGoalArray.push(catGoal[0]["values"][i]["key"]);
					}
				}
				console.log(catGoalArray);

				//get max value
				var maxGoal = d3.max(catGoalArray);




			//projects that appear within each month
       var projectPerMonthStates = d3.nest()

			  .key(function(d) {
          return d.launched.split("-")[1];
        })

			 .key(function(d) {
          return d.main_category == selection;
        })



     /*
   .key(function(d) {
          return d.state;
        })
*/

        .rollup(function(v) {
          return v.length;
        })
        .entries(data);




				console.log(projectPerMonthStates);




		//define scales
       /* x = d3.scaleLinear(), */
		/* 	xScale2 = d3.scaleLinear().range([0,width]), */
			var xScale2 = d3.scaleBand().rangeRound([width, 0]).padding(0.1);

       /* xScale2 = d3.scaleBand().rangeRound([width, 0]).padding(0.1); */
     /*  y = d3.scaleBand().rangeRound([height, 0]).padding(0.2); */
     var yScale2 = d3.scaleLinear().range([height, 0]);



		 	var valueline = d3.line()
		 	.x(function(d) {  return d.launched.split("-")[1];})
		 	.y(function(d) { return yScale2(d.pledged); });



      xScale2.domain(monthNames)
        .range([margin.left, width]);

      yScale2.domain([0,projectCountMax])
       .range([height, 10]);






var svg2 = d3.select("div#chartId2")
			.append("div")
			.classed("svg-container2", true) //container class to make it responsive
			.append("svg")
			.attr("preserveAspectRatio", "xMinYMin meet")
			.attr("viewBox", "0 0 1000 1200")
			//class to make it responsive
			.classed("svg-content-responsive", true);



/*
			var area = d3.area()
	    .curve(d3.curveMonotoneX)
	    .x(function(d) { return x(d.date); })
	    .y0(height)
	    .y1(function(d) { return y(d.price); });
*/



			//append x axis for months to svg
      svg2.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale2))
        .attr("y", 30)
        .attr("x", 800)
        .attr("font-size", "8px")
        .attr("padding", "16rem")

      //append y axis to svg for project number
      svg2.append("g")
        .attr("transform", "translate(100,0)")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale2))

    // svg2.append("path")
    //   .data(data)
    //   .attr("class", "line")
    //   .attr("d", valueline);



    circles = svg2.selectAll("circle.coordinate")
    .data(projectPerMonthStates)
    .enter()
    .append("circle")
    .attr("class", "coordinate")
    .attr("cx", function(d)
    {
    	return margin.Left + (xScale2(d.values[1].value));
    })
    .attr("cy", function(d)
    {
      	return yScale2(d.values[1].value);
    	/* var totalAmountofProjects = d.values[1].value; */
    	// if(d.values[1].key == "true"){
    	// return yScale2(d.values[1].value);
    	// }
    	// else{
	    // 	return yScale2(d.values[0].value);
    	// }
    	// ;


    })

  /*   y(function(d){d.main_categ}) */
/*   	.attr("x","50") */
    .attr("r","6")
    /* .attr("width","10px") */
    .style("fill","blue")

    /* .text(function(d){return d.values[1].value;}) */
    ;






    svg2.append("defs").append("clipPath")
    .attr("id", "clip")
		.append("rect")
    .attr("width", width)
    .attr("height", height);




/*
      var line = d3.line()
        .x(function(d){return d.key;})
        .y(projectCount)
        ;
*/



 /*

       var xBrushScale = xScale = d3.scaleBand().rangeRound([width, 0]).padding(0.1);
				var yBrushScale = d3.scaleLinear().range([height+50, 0]);


				var xAxis2 = d3.axisBottom(xBrushScale)

				xBrushScale.domain(xScale.domain);



				var context = svg.append("g")
    .attr("class", "context")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

				context.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height2 + ")")
      .call(xAxis2);

*/


/*
				var brush = d3.brushX()
			 .extent([[0, 0], [width, height+50]])
			 .on("brush end", brushed);

			        function brushed() {
			  if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
			  var s = d3.event.selection || x2.range();
			  x.domain(s.map(x2.invert, x2));
			  focus.select(".area").attr("d", area);
			  focus.select(".axis--x").call(xAxis);
			  svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
			      .scale(width / (s[1] - s[0]))
			      .translate(-s[0], 0));
			}

*/



}


/* graph2(); */




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
    //   Scalable
    //    https://stackoverflow.com/questions/16265123/resize-svg-when-window-is-resized-in-d3-js
