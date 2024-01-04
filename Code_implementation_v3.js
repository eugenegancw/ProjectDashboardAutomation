import myJson from './source/test_case_1.json' assert {type: 'json'};

function epoch (date) {
  return Date.parse(date)
}
//find function that return a list of labels

function retrieveDat_TimePeriod(start_date, end_date,label_x, data){
	/*
  - convert to epoch format for both start and end date
	- Use data filtering that are btwn the start and end date and also has the desired label
	- perform counts on the remaining data and return the count value
  */
	const start_epoch=epoch(start_date)
	const end_epoch=epoch(end_date)
	let newData= data.map(obj => {return {"label":obj.label, "camera": obj.camera, "time":obj.start_time}}) // only select the relevant fields for data analysis
	let newFilterData= newData.filter(row => (row.label===label_x) && (row.time<=end_epoch) && (row.time>start_epoch)) // only take in the rows if fulfil condition
	return newFilterData
}

//function to retrieve all the labels in the data
function retrieveLabels(data){
	const label_set = new Set();
  for (let i=0; i<data.length; i++){
  	if (data[i]['label']!="" && data[i]['label']!=null){ //not counting those that are left blank or invalid
    	label_set.add(data[i]['label'])
    }
  }
	return Array.from(label_set) // convert to array for easier manipulation
}

/* function specifically for bar graphs */
function extractWeeklyTableInfo(data){
  // retrieveCount_TimePeriod(start_date, end_date,label_x, data)
  // const today = new Date();
  // we marked this epochTime and seeded the today var so that we can still see some results based on test_case_1.json
  const epochTime = 1689053371000;
  const today = new Date(epochTime);
  let previousWeekDate = new Date(today);
  previousWeekDate.setDate(today.getDate() - 1 * 7);
  // const start_epoch=epoch(previousWeekDate)
	// const end_epoch=epoch(today)
  // console.log(start_epoch)
  let mapped_Data= data.map(obj => {return {"label":obj.label, "camera": obj.camera, "time":new Date(obj.start_time)}})

  // let filterData= mapped_Data.filter(row => (row.time<=end_epoch) && (row.time>start_epoch)) // only take in the rows if fulfil condition
  let final_lst=[]
  for (let i=0; i<mapped_Data.length;i++){
    let time_= mapped_Data[i].time
    if (time_<=today && time_>previousWeekDate){
      final_lst.push(Object.values(mapped_Data[i]))
    }
  }
  return final_lst;
}

function barChartPlotting(period, data){ //could be week, month
	//involved plotly plotting
	let dict={}
	const labelSet= retrieveLabels(data)
	// const today = new Date();
  const epochTime = 1689053371000;
  //we marked this epochTime and not based on today's date so that we can still see some results based on test_case_1.json
  const today = new Date(epochTime);
  console.log(today)
	if (period==='month'){
    let previousMonthDate = new Date(today);
    previousMonthDate.setMonth(today.getMonth() - 1);
		//for loop all the possible labels
		for (let i = 0; i < labelSet.length; i++){
			let filtered_dat=retrieveDat_TimePeriod(previousMonthDate, today, labelSet[i], data)
			dict[labelSet[i]]=filtered_dat.length
		}
	}

	else if (period==='week'){
    let previousWeekDate = new Date(today);
    previousWeekDate.setDate(today.getDate() - 1 * 7);
		//for loop all the possible labels
		for (let j = 0; j < labelSet.length; j++){
			let filtered_dat=retrieveDat_TimePeriod(previousWeekDate, today, labelSet[j], data)
			dict[labelSet[j]]=filtered_dat.length
		}
	}
	return dict

}
/* perform barchart plotting*/
function plotBarFromData(period, data){
    let items=barChartPlotting(period, data)
    let dat_x = [];
    let dat_y = [];
    for (const key in items){
        dat_x.push(key)
        dat_y.push(items[key])
    }
    var bars = [
      {
        x: dat_x,
        y: dat_y,
        type: 'bar'
      }
    ];
    return  bars
}

/* function specifically for line graphs */

function lineChartPlotting(period, data){ //could be either the week, month
  //involved plotly plotting
  //retrieve the last 4 months of the codes 
  let final_lst=[]
  let date_lst=[]
  const labelSet= retrieveLabels(data) //also return this for the labelling of the lines
  // var today = new Date();
  const epochTime = 1689053371000;
  //we marked this epochTime and not based on today's date so that we can still see some results based on test_case_1.json
  const today = new Date(epochTime);
  
  if (period==='month'){
    //retrieve the past 4 months date
    for (let a=0; a<4; a++){
      // let previousMonthDate=new Date(new Date().setDate(today.getDate() - a*30))
      let previousMonthDate = new Date(today);
      previousMonthDate.setMonth(today.getMonth() - a);
      date_lst.push(previousMonthDate)
    }

  }
  
  if (period==='week'){
    for (let b=0; b<4; b++){
      // let previousWeekDate=new Date(new Date().setDate(today.getDate() - b*7))
      let previousWeekDate = new Date(today);
      previousWeekDate.setDate(today.getDate() - b * 7);
      date_lst.push(previousWeekDate)
    }
  }
  console.log(date_lst)
  //for loop all the possible labels
  for (let k=0; k<4; k++){
    let inner_lst=[] //restart a new inner_lst
    let start_date=date_lst[k+1]
    let end_date=date_lst[k]
    // let month_=end_date.getMonth()
    inner_lst.push(end_date)
    for (let i = 0; i < labelSet.length; i++){
      let filtered_dat=retrieveDat_TimePeriod(start_date, end_date, labelSet[i], data); 
      inner_lst.push(filtered_dat.length) //the index of the inner_lst will be +1 ahead of the label_set
    }
    final_lst.push(inner_lst)
  }
  console.log(final_lst)
  // format of the list should be [['Jul', 19, 14, 18, 12], ['Jun', 15, 15, 18, 17], ['May', 12, 15, 16, 17]] in the order of loitering, intrusion, overflowing bins, overstay parking
  return [labelSet, final_lst] 
}

/* perform linechart plotting*/
function plotLineFromData(period, data){
    let lst = lineChartPlotting(period, data);
    let label_set=lst[0]
    let final_lst=lst[1]
    let x=[]
    //retrieve all the dates
    for (let a=0; a<final_lst.length; a++){
        x.push(final_lst[a][0])
    }
    //num of y lst depends on the number of features it can retrieve
    let num_features=label_set.length;
    let all_y_lst=[]
    for (let i=1; i<final_lst[0].length; i++){
        let y_i=[]
        for (let k=0; k<final_lst.length; k++){
            y_i.push(final_lst[k][i])
        }
        all_y_lst.push(y_i)
    }

    let traces=[]
    for (let i=0; i<all_y_lst.length; i++){
        traces[i]={
            x: x,
            y: all_y_lst[i],
            name: label_set[i],
            type: 'scatter'
        }
    }
    return traces
    // Plotly.newPlot('plot_2', traces);
}


/* function specifically for information regarding the monthly dashboard only*/
function findMaxLabel(data){
    let items = barChartPlotting("month", data) 
    // Create items array and sort them accordingly
    let items_ = Object.keys(items).map(function(key) {
      return [key, items[key]];
    });

    // Sort the array based on the second element
    items_.sort(function(first, second) {
      return second[1] - first[1];
    });
    let total=0
    let max_val=items_[0][1]
    let total_max=0
    //just create another total_value so that the percentage is from all the features and not per feature
    let features_lst=[]
    for (let i=0; i<items_.length; i++){
        // console.log(items_[i])
        total+=items_[i][1]
        if (items_[i][1]>=max_val){ // in the event that there are more than 1 with the max number of detections
            features_lst.push(items_[i][0])
            total_max+=items_[i][1]
        }
    }
    let max_percent= Math.round((total_max/total)*100)
    return [features_lst, max_percent] // output should be "${max_percent} comes from ${feature_x}, ..."
}

function findChanges(data){
    let overall_lst = lineChartPlotting("month", data) //return dict
    let totalChanges= 0
    let sign;
    let label_set=overall_lst[0], final_lst=overall_lst[1]
    //Assuming that the first lst is the most current date
    for (let i=1; i<final_lst[0].length; i++){
        let diff=final_lst[0][i]-final_lst[1][i]
        totalChanges+=diff
    }

    if (totalChanges>=0){
        sign="Increase"
    }
    else{
        totalChanges=-(totalChanges)
        sign="Decrease"
    }
    return [totalChanges, sign]
}

var month_barChart_layout = {
  font:{
    family: 'Raleway, sans-serif'
  },
  showlegend: false,
  xaxis: {
    tickangle: -45,
  },
  yaxis: {
    zeroline: false,
    gridwidth: 2,
    title: {
      text: 'Incidents',
      font: {
        family: 'Raleway, sans-seri',
        size: 18
      }
    }
  },
  bargap :0.05
};

var week_barChart_layout = {
  font:{
    family: 'Raleway, sans-serif'
  },
  showlegend: false,
  xaxis: {
    tickangle: -45,
  },
  yaxis: {
    zeroline: false,
    gridwidth: 2,
    title: {
      text: 'Incidents',
      font: {
        family: 'Raleway, sans-seri',
        size: 18
      }
    }
  },
  bargap :0.05
};

var lineChart_layout = {
  yaxis: {
    title: {
      text: 'Incidents',
      font: {
        family: 'Raleway, sans-seri',
        size: 18
      }
    }
  }
};
function generateTable(table_info){
  console.log("test")
  let tblBody = document.getElementById("t-body");
  // console.log(tblBody)
  for (let i=0; i<table_info.length; i++){
    var row=tblBody.insertRow(i)
    for (let j=0; j<table_info[0].length; j++){
      let cell=row.insertCell(j)
      cell.innerHTML = `${table_info[i][j]}`
    }
  }
}
/* execute functions here for monthly dashboard page*/

//find a way to edit it so that index_2 is not affected
if(document.getElementById("monthly_analysis")){
  let percent_lst=findMaxLabel(myJson);
  let percent_output= `${percent_lst[1]}% of all detections comes from ${percent_lst[0].toString()}`
  document.getElementById("greatest_precent").innerHTML=percent_output;
  
  let detection_lst=findChanges(myJson)
  let detection_output= `${detection_lst[1]} of ${detection_lst[0]}  of detection over the past month`
  document.getElementById("detection_output").innerHTML=detection_output;
  
  let months_bar_chart=plotBarFromData("month", myJson)
  let months_line_chart=plotLineFromData("month", myJson)
  Plotly.newPlot('plot_1', months_bar_chart, month_barChart_layout);
  Plotly.newPlot('plot_2', months_line_chart, lineChart_layout);
}
// {"label":obj.label, "camera": obj.camera, "time":obj.start_time}
/* execute functions here for weekly dashboard page*/
else if (document.getElementById("weekly_analysis")){
  let weeks_bar_chart=plotBarFromData("week", myJson)
  Plotly.newPlot('plot_3', weeks_bar_chart, week_barChart_layout);
  let table_info=extractWeeklyTableInfo(myJson);
  console.log(table_info)
  generateTable(table_info);
  // document.getElementById("table_")=table_info;
  // let weeks_line_chart=plotLineFromData("week", myJson)
  // Plotly.newPlot('plot_4', weeks_line_chart, lineChart_layout)
}



