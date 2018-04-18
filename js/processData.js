    var url = "https://www.sfu.ca/~jdlim/iat355/ks-projects-parsed.csv";

    var splitChart = false;
    //load in data from online source
    d3.csv(url, function(error, data) {
      //var margin = 100;
      var margin = {
        top: 20,
        right: 20,
        bottom: 40,
        left: 100
      };
      var padding = 50;

      var width = 800;
      var height = 500;

      var successChart;

      //count number of projects in each main category in each in nest
      var mainCatCount = d3.nest()
        .key(function(d) {
          return d.main_category;
        })
        .rollup(function(v) {
          return v.length;
        })
        .entries(data);

      //pushing "key" from d3 nest into an array
      //create array to hold category names
      var catArray = new Array();
      for (i = 0; i < mainCatCount.length; i++) {
        catArray.push(mainCatCount[i]["key"]);
      }

      //Parse different month
      var monthParse = d3.nest()

        .key(function(d) {
          return d.launched.split("-")[1];
        })

        .rollup(function(v) {
          return v.length;
        })
        .entries(data);

      var months = new Array();
      for (i = 0; i < monthParse.length; i++) {
        months.push(monthParse[i]["key"]);
      }

      sortMonths = months.sort();

      console.log(sortMonths);

      var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      console.log(monthNames[parseInt(sortMonths[0]) - 1]);

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

      //change type of data if needed (for later)
      data.forEach(function(d) {
        d.main_category = d.main_category;
        d.goal = +d.goal;
        d.pledged = +d.pledged;
      });

      var maxNumberProject = d3.max(catValueArray);

      //define color scale
      var colorScale =
        d3.scaleLinear()
        .domain([0, 15])
        .range(["rgb(143, 226, 133)", "rgb(186, 42, 85)"]);

      // Define the div for the tooltip
      var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

      //function to call first graph
      function graph1() {

        //define scales
        let xScale = d3.scaleLinear(),
          yScale = d3.scaleBand().rangeRound([height, 0]).padding(0.2);

        xScale.domain([0, maxNumberProject])
          .range([margin.left, width]);

        yScale.domain(catArray)
          .range([height, 10]);

        //select first div in html to place first graph in
        var svg = d3.select("div#chartId")
          .append("div")
          .classed("svg-container", true) //container class to make it responsive
          .append("svg")
          .attr("preserveAspectRatio", "xMinYMin meet")
          //.attr("viewBox", "0 0 " + (width) + " " + (height))
          .attr("viewBox", "0 0 1000 600")
          //class to make it responsive
          .classed("svg-content-responsive", true);


        //create bar (length based on successes in each category)
        var bar = svg.selectAll("x")
          .data(projectCount)
          .enter()
          .append("rect")
          .attr("class", "barRect bar")
          .style('fill', function(d) {
            return colorScale(1);
          })
          .attr("x", margin.left)
          .attr("y", function(d) {
            return yScale(d.key);
          })
          .attr("height", yScale.bandwidth())

          //when graph is clicked, show graph 2 showing specific data to the category clicked on
          .on("click", function(d) {

            graph2(d.key);
            document.getElementById("chartId2").style.display = "block";
            document.getElementById("brush-tool").style.display = "block";
            document.getElementById("hidden").style.display = "block";

          })

          //add tool-tip function to show value when hover
          .on("mouseover", function(d) {
            if (d.values[1].key == "successful") {
              var successNo = d.values[1].value;
            } else {
              var successNo = d.values[0].value;
            }
            div.transition()
              .duration(200)
              .style("opacity", .9);
            div.text(successNo)
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
            if (d.values[1].key == "successful") {
              return xScale(d.values[1].value) - margin.left;
            } else {
              return xScale(d.values[0].value) - margin.left;
            }
          });

        //create bar (length based on successes in each category)
        var bar2 = svg.selectAll("bar2")
          .data(projectCount)
          .enter()
          .append("rect")
          .attr("class", "barRect bar2")
          .style('fill', function(d) {
            return colorScale(15);
          })
          //calculate width of bar based on success value in each category
          //to find starting position for graph
          .attr("x", function(d) {
            if (d.values[1].key == "successful") {
              return xScale(d.values[1].value);
            } else {
              return xScale(d.values[0].value);
            }
          })


          .on("click", function(d) {
            var highlightkey = d.key;
            graph2(highlightkey);
            console.log(highlightkey);

            document.getElementById("chartId2").style.display = "block";
            document.getElementById("brush-tool").style.display = "block";
            document.getElementById("hidden").style.display = "block";
          })

          //add tool-tip function to show value when hover
          .on("mouseover", function(d) {
            if (d.values[0].key == "failed") {
              var failedNo = d.values[0].value;
            } else {
              var failedNo = d.values[1].value;
            }
            div.transition()
              .duration(200)
              .style("opacity", .9);
            div.text(failedNo)
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
            if (d.values[0].key == "failed") {
              return xScale(d.values[0].value) - margin.left;
            } else {
              return xScale(d.values[1].value) - margin.left;
            }
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
          .attr("class", "y-axis  baryaxis")
          .call(d3.axisLeft(yScale))

        //label for y axis: kickstarter main categories
        svg.append("text")
          .attr("id", "yAxisText")
          .attr("transform", "rotate(-90)")
          .attr("y", 0)
          .attr("x", 0 - (height / 2))
          .attr("dy", "1em")
          .style("text-anchor", "middle")
          .text("Kickstarter Main Categories");

        //label for x axis: # of Project Per Category
        svg.append("text")
          .attr("id", "xAxisText")
          .attr("transform",
            "translate(" + (width / 2) + " ," +
            (height + margin.bottom) + ")")
          .style("text-anchor", "middle")
          .text("# of Projects Per Category");

        //sort the mainCatCount by descending order, returning only # of success/failures
        var sortBars = function() {
          var sortScale = mainCatCount.sort(function(a, b) {
            return b.value - a.value;
          }).map(function(d) {
            return d['key'];
          });

          console.log(sortScale)
          yScale.domain(sortScale);

          svg.selectAll(".bar")
            .sort(function(a, b) {
              return yScale(a.key) - yScale(b.key)
            });

          svg.selectAll(".bar").transition()

            .attr("y", function(d) {
              return yScale(d.key);
            })

          svg.selectAll(".bar2")

            .sort(function(a, b) {
              return yScale(a.key) - yScale(b.key)
            });

          svg.selectAll(".bar2").transition()
            .attr("y", function(d) {
              return yScale(d.key);
            })

          svg.selectAll(".baryaxis")

            .call(d3.axisLeft(yScale))
        };

        d3.select("#sort").on("click", sortBars);

        var widthFailed = function(d) {
          if (d.values[0].key == "failed") {
            return xScale(d.values[0].value) - margin.left;
          } else {
            return xScale(d.values[1].value) - margin.left;
          }
        }

        var splitBars = function() {

          splitChart = true;

          var xScaleInvert = d3.scaleLinear()
          xScaleInvert.domain([0, maxNumberProject])
            .range([width, margin.left]);

          d3.select("svg")
            .attr("viewBox", "-580 0 1000 600")
          d3.select("#xAxisText")
            .attr("x", "-500")

          d3.select("#yAxisText")
            .attr("y", "-550")

          d3.selectAll(".legend")
            .attr("x", "-500")

          d3.selectAll(".legendText")
            .attr("x", "-470")

          d3.selectAll(".bar2")
            .attr("x", function(d) {
              if (d.values[1].key == "failed") {
                return xScale(-d.values[1].value);
              } else {
                return xScale(-d.values[0].value);
              }
            })
            .attr("width", widthFailed);

          //draws scale on opposite side
          svg.append("g")
            .attr("class", "x-axisInv")
            .attr("transform", "translate(-700 ," + height + ")")
            .call(d3.axisBottom(xScaleInvert))
        }

        d3.select("#split").on("click", splitBars);

        // Add the "success" text to show/hide data
        svg.append("text")
          .attr("x", width - margin.right)
          .attr("y", margin.top)
          .attr("class", "button")
          .attr("class", "legendText")
          .style("fill", "rgb(143, 226, 133)")
          .style("cursor", "pointer")
          .on("click", function() {
            // Determine if current line is visible
            var active = bar.active ? false : true,
              newOpacity = active ? 0 : 1;


            // Hide or show the elements
            d3.selectAll(".bar").style("opacity", newOpacity);

            // Update whether or not the elements are active
            bar.active = active;

            if (active == true) {
              d3.selectAll(".bar2").attr("x", function(d) {
                return xScale(0);
              })
            } else {
              d3.selectAll(".bar2").attr("x", function(d) {
                if (d.values[1].key == "successful") {
                  return xScale(d.values[1].value);
                } else {
                  return xScale(d.values[0].value);
                }
              })
            }
          })
          .text("Success");

        svg.append("rect")
          .attr("x", width - margin.right - 30)
          .attr("y", margin.top - 15)
          .attr("class", "c")
          .attr("class", "legend")
          .attr("width", "20")
          .attr("height", "20")
          .style("cursor", "pointer")
          .on("click", function() {

            //check if bar chosen is 'active' and opacity is full
            var active = bar.active ? false : true,
              newOpacity = active ? 0 : 1;

            // Determine if current line is visible
            if (splitChart == true) {


              // Hide or show the elements
              d3.selectAll(".bar").style("opacity", newOpacity);

              //Update whether or not the elements are active
              bar.active = active;
            } else {


              // Hide or show the elements
              d3.selectAll(".bar").style("opacity", newOpacity);

              //Update whether or not the elements are active
              bar.active = active;

              if (active == true) {
                d3.selectAll(".bar2").attr("x", function(d) {
                  return xScale(0);
                })
              } else {
                d3.selectAll(".bar2").attr("x", function(d) {
                  if (d.values[1].key == "successful") {
                    return xScale(d.values[1].value);
                  } else {
                    return xScale(d.values[0].value);
                  }
                })
              }
            }
          })
          .style("fill", "rgb(143, 226, 133)");

        //draw squares for legendColor
        svg.append("rect")
          .attr("x", width - margin.right - 30)
          .attr("y", margin.top + 13)
          .attr("class", "legend")
          .attr("width", "20")
          .attr("height", "20")
          .style("cursor", "pointer")
          .on("click", function() {
            // Determine if current line is visible
            var active = bar2.active ? false : true,
              newOpacity = active ? 0 : 1;
            // Hide or show the elements
            d3.selectAll(".bar2").style("opacity", newOpacity);
            // Update whether or not the elements are active
            bar2.active = active;
          })
          .style("fill", "rgb(186, 42, 85)");

        // Add the "failed" text to show/hide data
        svg.append("text")
          .attr("x", width - margin.right)
          .attr("y", margin.top + 30)
          .attr("class", "button")
          .attr("class", "legendText")
          .style("fill", "rgb(186, 42, 85)")
          .style("cursor", "pointer")
          .on("click", function() {
            // Determine if current line is visible
            var active = bar2.active ? false : true,
              newOpacity = active ? 0 : 1; // Hide or show the elements
            d3.selectAll(".bar2").style("opacity", newOpacity);
            // Update whether or not the elements are active
            bar2.active = active;
          })
          .text("Failed");
      }

      //function calling to draw graph 1
      graph1();


      //function to create graph 2
      function graph2(selection) {

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

        //create an array to hold the month values (1-12)
        var months = new Array();
        for (i = 0; i < monthParse.length; i++) {
          months.push(monthParse[i]["key"]);
        }

        //parse out the number of projects that appear per month
        var values = new Array();
        for (i = 0; i < projectPerMonth[1]["values"].length; i++) {
          if (projectPerMonth[1]["key"] == "true") {
            values.push(projectPerMonth[1]["values"][i]["value"]);
          } else {
            values.push(projectPerMonth[0]["values"][i]["value"]);
          }
        }

        //parse out the number of projects that appear per month
        var valuesFailed = new Array();
        for (i = 0; i < projectPerMonth[1]["values"].length; i++) {
          if (projectPerMonth[1]["key"] == "true") {
            values.push(projectPerMonth[1]["values"][i]["value"]);
          } else {
            values.push(projectPerMonth[0]["values"][i]["value"]);
          }
        }

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

        //projects that appear within each month
        var projectPerMonthStates = d3.nest()

          .key(function(d) {
            return d.launched.split("-")[1];
          })

          .key(function(d) {
            return d.main_category == selection;
          })

          .key(function(d) {
            return d.state;
          })

          .rollup(function(v) {
            return v.length;
          })
          .entries(data);

        //define scales
        var xScale2 = d3.scalePoint();
        var yScale2 = d3.scaleLinear().range([height, 0]);


        xScale2.domain(monthNames)
          .range([margin.left, 1000]);

        yScale2.domain([0, 100])
          .range([height, 10]);


        //remove 2nd graph if it already exists
        d3.select("div#chartId2").selectAll("div").remove();



        var selected = document.getElementById(selection);
        if (selected == null) {


          var xScale3 = d3.scalePoint();
          var yScale3 = d3.scaleLinear().range([100, 0]);


          var smallWidth = 300;
          var smallHeight = 400;


          xScale3.domain(monthNames)
            .range([margin.left, 1000]);

          yScale3.domain([0, projectCountMax])
            .range([smallHeight, 10]);

          var valueline = d3.line()
            .x(function(d) {
              return xScale3(d.launched.split("-")[1]);
            })
            .y(function(d) {
              return yScale3(d.pledged);
            });



          //append a new div in html inside chartId3 to contain graph
          var svg3 = d3.select("div#chartId3")
            .append("div")
            .classed("svg-container3 col-4-12", true) //container class to make it responsive
            .attr("id", selection)
            .append("svg")

            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", "0 0 1000 550")
            //class to make it responsive
            .classed("svg-content-responsive2", true);

          //append name of category to small multiples
          svg3.append("text")
            .text(selection)
            .attr("font-size", "40px")
            .attr("y", smallHeight + 75)
            .attr("x", 100);

          //remove button got small multiples
          svg3.append("text")
            .attr("class", "close")
            .attr("x", 1000 - 125)
            .attr("y", smallHeight + 75)
            .attr("font-size", "30px")
            .attr("style", "text-transform:uppercase")
            .on("click", function(d) {
              deleteSelectedChart(selection);
            })
            .text("remove");

          svg3.append("g")
            .attr("class", "y-axis")
            .attr("transform", "translate(100,0)")
            .attr("font-size", "0px")
            .call(d3.axisLeft(yScale3))

          //label for y axis: Number of Projects
          svg3.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 40)
            .attr("x", 20 - (height / 2))
            .attr("dy", "1em")
            .attr("font-size", "20px")
            .style("text-anchor", "middle")
            .text("Number of Projects");


          //append x axis for months to svg
          svg3.append("g")
            .attr("class", "x-axis")
            .attr("transform", "translate(0," + smallHeight + ")")
            .call(d3.axisBottom(xScale3))
            .attr("y", 30)
            .attr("x", 800)
            .attr("font-size", "14px")
            .attr("padding", "16rem")
          line = d3.line()
            .x(function(d) {
              return xScale3(monthNames[d.key - 1]);
            })
            .y(function(d) {
              if (d.values[1].key == "true") {
                if (d.values[1].values[0].key == "successful") {
                  return yScale3(d.values[1].values[0].value);
                } else {
                  return yScale3(d.values[1].values[1].value);
                }
              } else {

                if (d.values[0].values[0].key == "successful") {
                  return yScale3(d.values[0].values[0].value);
                } else {
                  return yScale3(d.values[0].values[1].value);
                }
              }
            })

          svg3.append("path")
            .datum(projectPerMonthStates.sort(function(a, b) {
              return a.key - b.key;
            }))

            .attr("class", "success")
            .attr("stroke", "rgb(143, 226, 133)")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("fill", "none")
            .attr("stroke-width", 4)
            .attr("d", line);

          line = d3.line()

            .x(function(d) {
              return xScale3(monthNames[d.key - 1]);
            })
            .y(function(d) {
              if (d.values[1].key == "true") {
                if (d.values[1].values[0].key == "failed") {
                  return yScale3(d.values[1].values[0].value);
                } else {
                  return yScale3(d.values[1].values[1].value);
                }
              } else {

                if (d.values[0].values[0].key == "failed") {
                  return yScale3(d.values[0].values[0].value);
                } else {
                  return yScale3(d.values[0].values[1].value);
                }
                return yScale3(d.values[0].values[0].value);
              }

            })

          svg3.append("path")
            .datum(projectPerMonthStates.sort(function(a, b) {

              return a.key - b.key;

            }))
            .attr("class", "failed")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("fill", "none")
            .attr("stroke", "rgb(186, 42, 85)")
            .attr("stroke-width", 4)
            .attr("d", line);

        } else {
          //If id already exist, then don't generate any charts
        }

        //append a new div in html inside chartId2 to contain graph
        var svg2 = d3.select("div#chartId2")
          .append("div")
          .classed("svg-container2", true) //container class to make it responsive
          .append("svg")
          .attr("preserveAspectRatio", "xMinYMin meet")
          .attr("viewBox", "0 0 1100 600")
          //class to make it responsive
          .classed("svg-content-responsive", true);

        //append x axis for months to svg
        svg2.append("g")
          .attr("class", "x-axis")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(xScale2))
          .attr("y", 30)
          .attr("x", 800)
          .attr("font-size", "14px")
          .attr("padding", "16rem")

        //append y axis to svg for project number
        svg2.append("g")
          .attr("class", "y-axis")
          .attr("transform", "translate(100,0)")
          .attr("font-size", "14px")
          .call(d3.axisLeft(yScale2))


        //label title for current graph shown
        svg2.append("text")
          .attr("y", 0)
          .attr("x", margin.left + 50)
          .attr("dy", "1em")
          .attr("class", "graphTitle")
          .style("font-size", "24px")
          .style("color", "#3ea057")
          .text(selection);


        //label for y axis: kickstarter main categories
        svg2.append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 0)
          .attr("x", 0 - (height / 2))
          .attr("dy", "1em")
          .style("text-anchor", "middle")
          .text("Number of Projects by Percent");

        //label for x axis: # of Project Per Category
        svg2.append("text")
          .attr("transform",
            "translate(" + (width / 2 + 150) + " ," +
            (height + margin.top + 50) + ")")
          .style("text-anchor", "middle")
          .text("Month Project was Launched");

        //draw all the circles corrisponding to success
        circles = svg2.selectAll("circle.coordinate")
          .data(projectPerMonthStates)
          .enter()
          .append("circle")
          .attr("class", "coordinate success")
          .attr("cx", function(d) {
            console.log(d.key + "  in text " + monthNames[d.key - 1])

            return xScale2(monthNames[d.key - 1]);
          })

          //add tool-tip function to show value when hover
          .on("mouseover", function(d) {
            if (d.values[1].key == "true") {
              //variable for percentage
              var successPer;
              //variable for number of projects
              var successTot;
              total = d.values[1].values[0].value + d.values[1].values[1].value;

              if (d.values[1].values[0].key == "successful") {
                successTot = d.values[1].values[0].value;
                successPer = d3.format(".2f")(d.values[1].values[0].value / total * 100);
              } else {
                successTot = d.values[1].values[1].value;
                successPer = d3.format(".2f")(d.values[1].values[1].value / total * 100);
              }
            } else {
              total = d.values[0].values[0].value + d.values[0].values[1].value;
              if (d.values[0].values[0].key == "successful") {
                successTot = d.values[0].values[0].value;
                successPer = d3.format(".2f")(d.values[0].values[0].value / total * 100);
              } else {
                successTot = d.values[0].values[1].value;
                successPer = d3.format(".2f")(d.values[0].values[1].value / total * 100);
              }
            }

            div.transition()
              .duration(200)
              .style("opacity", .9);
            div.text(successPer + "%" + "   projects: " + successTot)
              .style("left", (d3.event.pageX + d.values.length) + "px")
              .style("top", (d3.event.pageY) + "px");
          })
          .on("mouseout", function(d) {
            div.transition()
              .duration(500)
              .style("opacity", 0);
          })
          .attr("cy", function(d) {
            if (d.values[1].key == "true") {
              total = d.values[1].values[0].value + d.values[1].values[1].value;

              if (d.values[1].values[0].key == "successful") {
                return yScale2(d.values[1].values[0].value / total * 100);
              } else {
                return yScale2(d.values[1].values[1].value / total * 100);
              }
            } else {
              total = d.values[0].values[0].value + d.values[0].values[1].value;
              if (d.values[0].values[0].key == "successful") {
                return yScale2(d.values[0].values[0].value / total * 100);
              } else {
                return yScale2(d.values[0].values[1].value / total * 100);
              }
            }
          })
          .transition()
          .attr("r", "6")
          .style("display", function(d) {
            return d == null ? "none" : null;
          })
          .style("fill", function(d) {
            return ("rgb(143, 226, 133)");
          });

        //created 2nd set of circles to show failed projects
        circles2 = svg2.selectAll("circle.coordinate2")
          .data(projectPerMonthStates)
          .enter()
          .append("circle")
          .attr("class", "coordinate2 failed")
          .attr("cx", function(d) {
            console.log(d.key + "  in text " + monthNames[d.key - 1])

            return xScale2(monthNames[d.key - 1]);
          })

          //add tool-tip function to show value when hover
          .on("mouseover", function(d) {
            if (d.values[1].key == "true") {
              //variable for percentage
              var failPer;
              //variable for number of projects
              var failTot;
              total = d.values[1].values[0].value + d.values[1].values[1].value;

              if (d.values[1].values[0].key == "failed") {
                failTot = d.values[1].values[0].value;
                failPer = d3.format(".2f")(d.values[1].values[0].value / total * 100);
              } else {
                failTot = d.values[1].values[1].value;
                failPer = d3.format(".2f")(d.values[1].values[1].value / total * 100);
              }
            } else {
              total = d.values[0].values[0].value + d.values[0].values[1].value;
              if (d.values[0].values[0].key == "failed") {
                failTot = d.values[0].values[0].value;
                failPer = d3.format(".2f")(d.values[0].values[0].value / total * 100);
              } else {
                failTot = d.values[0].values[1].value;
                failPer = d3.format(".2f")(d.values[0].values[1].value / total * 100);
              }
            }

            div.transition()
              .duration(200)
              .style("opacity", .9);
            div.text(failPer + "%" + "   projects: " + failTot)
              .style("left", (d3.event.pageX + d.values.length) + "px")
              .style("top", (d3.event.pageY) + "px");
          })
          .on("mouseout", function(d) {
            div.transition()
              .duration(500)
              .style("opacity", 0);
          })

          .attr("cy", function(d) {

            if (d.values[1].key == "true") {
              total = d.values[1].values[0].value + d.values[1].values[1].value;

              if (d.values[1].values[0].key == "failed") {
                return yScale2(d.values[1].values[0].value / total * 100);
              } else {
                return yScale2(d.values[1].values[1].value / total * 100);
              }
            } else {
              total = d.values[0].values[0].value + d.values[0].values[1].value;

              if (d.values[0].values[0].key == "failed") {
                return yScale2(d.values[0].values[0].value / total * 100);
              } else {
                return yScale2(d.values[0].values[1].value / total * 100);
              }
            }
          })

          .transition()
          .attr("r", "6")
          .style("display", function(d) {
            return d == null ? "none" : null;
          })
          .style("fill", function(d) {
            return ("rgb(186, 42, 85)");
          });

        svg2.append("defs").append("clipPath")
          .attr("id", "clip")
          .append("rect")
          .attr("width", width)
          .attr("height", height);
      }
    });

    var down = false;
    //hover to show success nodes only
    function filterSuccess() {
      var down = true;
      d3.select("div#chartId2")
        .selectAll("circle.failed")
        .style("opacity", "0.2");

      d3.select("div#chartId2")
        .selectAll("circle.success")
        .transition()
        .attr("r", "10");

    }

    //hover out show normal state
    function backToNormal() {
      d3.select("div#chartId2").selectAll("circle.failed").style("opacity", "1").attr("r", "6");
      d3.select("div#chartId2").selectAll("circle.success").style("opacity", "1").attr("r", "6");
    }

    //delete all line charts from view
    function deleteChart() {
      d3.select("div#chartId3").selectAll("div.svg-container3").remove();

    }

    //delete only selected charts
    function deleteSelectedChart(selection) {
      d3.select("div#chartId3").selectAll("div#" + selection).remove();
    }


    //hover to show failed nodes only
    function filterFailed() {
      d3.select("div#chartId2")
        .selectAll("circle.success")
        .style("opacity", "0.2");

      d3.select("div#chartId2")
        .selectAll("circle.failed")
        .transition()
        .attr("r", "10");
    }

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
