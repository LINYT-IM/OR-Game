let DOMobj = {
  td: document.querySelectorAll(".table-Knapsack td"),
  start: document.querySelector(".start-Knapsack"),
  reset: document.querySelector(".reset-Knapsack"),
  ans: document.querySelector(".checked"),
  obj: document.querySelector(".Obj"),
  wig: document.querySelector(".Weight"),
  gap: document.querySelector(".Gap"),
  best: document.querySelector(".Best"),
  alert: document.querySelector(".alert"),
  btn: document.querySelectorAll(".ans-btn>td"),
  text_wei: document.querySelector("#weight-limit"),
  text_n: document.querySelector("#node_n"),
  ans_change: document.querySelector(".ans-segment"),
  uid_btn: document.querySelector("#uid-ipt"),
};
firebase.initializeApp({
  databaseURL: "https://or-game-2ef8c-default-rtdb.firebaseio.com/",
});
// let ipAddress = "";
// $.getJSON("https://httpbin.org/ip", function (data) {
//   ipAddress = data["origin"];
// });
let UID = "";
let res = {
  obj: 0,
  sol: {},
  weight: 0,
};
// const database = firebase.database();
var newPostKey = firebase.database().ref().child("Knapsack/").push().key;
// let data = window.Knapsackdata[Math.floor(Math.random() * 5)];
let data = window.Knapsackdata[0];

// 頁面顯示
{
  const showData = function () {
    // colspan setting
    DOMobj.td.forEach((obj) => (obj.colSpan = data["n"]));
    DOMobj.btn.forEach((obj) => (obj.colSpan = data["n"] / 2));
    // data setting
    DOMobj.text_n.textContent = data["n"];
    DOMobj.text_wei.textContent = data["weightlimit"];
    let anc = document.querySelector(".ans-segment");
    let pic = document.createElement("tr");
    let pic_inner = "";
    let ipt = document.createElement("tr");
    ipt.classList.add("input-tr");
    let ipt_inner = "";
    for (let i in data["obj"]) {
      obj = data["obj"][i];
      pic_inner += `<td class="choice" id="${i}"><img src="./images/${obj["name"]}.svg" alt=""><div>$${obj["price"]}<br>${obj["weight"]}g</div></td>`;
      ipt_inner += `<td ><div class="ui input quan" ><input class="quantity" id="q${i}" type="number" min="0" placeholder="0"></div></td>`;
    }
    pic.innerHTML = pic_inner;
    ipt.innerHTML = ipt_inner;
    insertAfter(ipt, anc);
    insertAfter(pic, anc);
    DOMobj.input = document.querySelectorAll(".choice");
    DOMobj.quantity = document.querySelectorAll(".quantity");
    setEvent();
  };
  showData();

  function setEvent() {
    DOMobj.input.forEach((obj) =>
      obj.addEventListener("click", function () {
        // clearChoice();
        this.classList.toggle("checked");
      })
    );
  }
  function insertAfter(newNode, existingNode) {
    existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
  }
  function clearChoice() {
    DOMobj.input.forEach((obj) => obj.classList.remove("checked"));
    DOMobj.quantity.forEach((obj) => (obj.value = ""));
    DOMobj.alert.textContent = "";
  }
  function clearAlert() {
    DOMobj.quantity.forEach((obj) => obj.parentNode.classList.remove("error"));
  }
}

// 控制單元
{
  let bestGap = 100;
  function onChange() {
    let flag = true;
    let final = false;

    let selected = document.querySelectorAll(".choice.checked");
    let selected_id = [];
    let objval;
    clearAlert();
    for (let i = 0; i < selected.length; i++) {
      selected_id.push(parseInt(selected[i].id));
      if (DOMobj.quantity[selected[i].id].value == "") {
        flag = false;
        DOMobj.quantity[selected[i].id].parentNode.classList.add("error");
      }
    }
    clearResults();
    if (flag) {
      final = calculateObj(selected_id);
    }
    return final;
  }
  DOMobj.start.addEventListener("click", function () {
    if (UID == "") {
      $(".mini.modal").modal("setting", "closable", false).modal("show");
    }
    let flag = onChange();
    if (flag) {
      updateScore(UID, res["obj"], res["sol"], res["weight"]);
    }
  });
  function updateScore(UID, score, sol, weight) {
    if (UID != "") {
      var updates = {};
      updates["/Knapsack/val/" + UID] = score;
      updates["/Knapsack/sol/" + UID] = sol;
      updates["/Knapsack/weight/" + UID] = weight;
      firebase.database().ref().update(updates);
    }
  }
  DOMobj.reset.addEventListener("click", function () {
    clearAlert();
    clearChoice();
  });
  $(".mini.modal").modal("setting", {
    onApprove: function () {
      // console.log(DOMobj.uid_btn);
      UID = DOMobj.uid_btn.value;
      if (UID == "" || UID == undefined) {
        DOMobj.uid_btn.parentNode.classList.add("error");
        return false;
      } else {
        updateScore(UID, res["obj"], res["sol"], res["weight"]);
      }
    },
  });

  function clearResults() {
    objval = "*";
    currgap = "*";
    DOMobj.obj.textContent = objval;
    DOMobj.gap.textContent = currgap;
    DOMobj.alert.textContent = "";
  }

  function calculateObj(selected_id) {
    // 計算obj值、GAP值
    let objval = 0;
    let totalweight = 0;
    let currgap = 90;
    let updated = false;
    let solution = {};
    let flag = false;
    // calculate obj
    for (let i = 0; i < selected_id.length; i++) {
      solution[selected_id[i]] = DOMobj.quantity[selected_id[i]].value;
      objval +=
        DOMobj.quantity[selected_id[i]].value *
        data["obj"][selected_id[i]]["price"];
      totalweight +=
        DOMobj.quantity[selected_id[i]].value *
        data["obj"][selected_id[i]]["weight"];
    }
    if (totalweight > data["weightlimit"]) {
      // infeasible
      objval = "*";
      currgap = "*";
      res["weight"] = "*";
      DOMobj.alert.textContent = "infeasible!!";
    } else {
      // calculate gap
      flag = true;
      res["obj"] = objval;
      res["sol"] = solution;
      res["weight"] = totalweight;
      currgap =
        Math.round(
          ((data["opt"]["val"] - objval) / data["opt"]["val"]) * 10000
        ) / 100;

      if (currgap < bestGap) {
        bestGap = currgap;
      }
    }
    DOMobj.best.textContent = bestGap;
    DOMobj.obj.textContent = objval;
    DOMobj.gap.textContent = currgap;
    DOMobj.wig.textContent = res["weight"];
    return flag;
  }
  DOMobj.quantity.forEach((obj) =>
    obj.addEventListener("change", function () {
      let flag = onChange();
    })
  );
  DOMobj.input.forEach((obj) =>
    obj.addEventListener("click", function () {
      let flag = onChange();
    })
  );
}
