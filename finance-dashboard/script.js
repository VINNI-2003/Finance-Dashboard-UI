const state = {
transactions: [
{date:"2026-03-01",category:"Salary",amount:50000,type:"income"},
{date:"2026-03-02",category:"Food",amount:5000,type:"expense"},
{date:"2026-03-03",category:"rent",amount:7000,type:"expense"},
{date:"2026-03-04",category:"Shopping",amount:5000,type:"expense"},
{date:"2026-03-05",category:"Bills",amount:7000,type:"expense"}
],
filterType: "all",
searchText: "",
role: "viewer"
};

const table = document.getElementById("transactionTable");
const roleSelect = document.getElementById("roleSelect");
const addBtn = document.getElementById("addBtn");
const search = document.getElementById("search");
const filter = document.getElementById("filterType");

const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");

let pieChart, lineChart;

function setState(updates){
Object.assign(state, updates);
render();
}

search.oninput = e => setState({ searchText: e.target.value });
filter.onchange = e => setState({ filterType: e.target.value });
roleSelect.onchange = e => setState({ role: e.target.value });

function render(){
table.innerHTML="";

let filtered = state.transactions
.map((t,i)=>({...t, originalIndex:i}))
.filter(t =>
(state.filterType==="all" || t.type===state.filterType) &&
t.category.toLowerCase().includes(state.searchText.toLowerCase())
);

filtered.forEach(t=>{
table.innerHTML+=`
<tr>
<td>${t.date}</td>
<td>${t.category}</td>
<td>₹${t.amount}</td>
<td>${t.type}</td>
<td>
<button class="edit" onclick="edit(${t.originalIndex})">Edit</button>
<button class="delete" onclick="del(${t.originalIndex})">Delete</button>
</td>
</tr>`;
});

summary();
pie();
line();
insights();
}

function summary(){
let income=0,expense=0;
state.transactions.forEach(t=>{
t.type==="income"?income+=t.amount:expense+=t.amount;
});
incomeEl.textContent="₹"+income;
expenseEl.textContent="₹"+expense;
balanceEl.textContent="₹"+(income-expense);
}

function pie(){
let data={};
state.transactions.forEach(t=>{
if(t.type==="expense"){
data[t.category]=(data[t.category]||0)+t.amount;
}
});

if(pieChart) pieChart.destroy();

pieChart=new Chart(document.getElementById("pieChart"),{
type:"pie",
data:{labels:Object.keys(data),datasets:[{data:Object.values(data)}]}
});
}

function line(){
let monthly={};
state.transactions.forEach(t=>{
let m=t.date.slice(0,7);
monthly[m]=(monthly[m]||0)+t.amount;
});

if(lineChart) lineChart.destroy();

lineChart=new Chart(document.getElementById("lineChart"),{
type:"line",
data:{labels:Object.keys(monthly),datasets:[{data:Object.values(monthly)}]}
});
}

function insights(){
let catTotals={}, monthTotals={};

state.transactions.forEach(t=>{
if(t.type==="expense"){
catTotals[t.category]=(catTotals[t.category]||0)+t.amount;
let m=t.date.slice(0,7);
monthTotals[m]=(monthTotals[m]||0)+t.amount;
}
});

let maxCat="", maxAmt=0;
for(let c in catTotals){
if(catTotals[c]>maxAmt){ maxAmt=catTotals[c]; maxCat=c; }
}

let months=Object.keys(monthTotals).sort();
let thisM=months[months.length-1]||"";
let lastM=months[months.length-2]||"";

let thisAmt=monthTotals[thisM]||0;
let lastAmt=monthTotals[lastM]||0;
let diff=thisAmt-lastAmt;

document.getElementById("insightHighest").textContent=`${maxCat} ₹${maxAmt}`;
document.getElementById("insightThis").textContent=`₹${thisAmt} (${thisM})`;
document.getElementById("insightLast").textContent=`₹${lastAmt} (${lastM})`;

let trendEl=document.getElementById("insightTrend");

if(months.length<2){
trendEl.textContent="Not enough data";
}else if(diff>0){
trendEl.textContent=`📈 +₹${diff}`;
}else if(diff<0){
trendEl.textContent=`📉 -₹${Math.abs(diff)}`;
}else{
trendEl.textContent="➖ No change";
}
}

function edit(i){
if(state.role!=="admin") return alert("Admin only");

let t=state.transactions[i];

let category=prompt("Category",t.category);
let amount=prompt("Amount",t.amount);
let type=prompt("Type",t.type);

if(category!==null) t.category=category;
if(amount!==null) t.amount=Number(amount);
if(type!==null) t.type=type;

render();
}

function del(i){
if(state.role!=="admin") return alert("Admin only");
state.transactions.splice(i,1);
render();
}

addBtn.onclick=()=>{
if(state.role!=="admin") return alert("Admin only");

let category=prompt("Category");
let amount=prompt("Amount");
let type=prompt("income/expense");

if(!category || !amount || !type) return;

state.transactions.push({
date:new Date().toISOString().split("T")[0],
category,
amount:Number(amount),
type
});

render();
};

document.getElementById("darkToggle").onclick=()=>{
document.body.classList.toggle("dark");
};

render();