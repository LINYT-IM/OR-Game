let DOMobj = {
  td: document.querySelectorAll(".table-Knapsack td"),
  start: document.querySelector(".start-Knapsack"),
  reset: document.querySelector(".reset-Knapsack"),
  ans: document.querySelector(".checked"),
  obj: document.querySelector(".Obj"),
  gap: document.querySelector(".Gap"),
  best: document.querySelector(".Best"),
  alert: document.querySelector(".alert"),
  btn: document.querySelectorAll(".ans-btn>td"),
  text_wei: document.querySelector("#weight-limit"),
  text_n: document.querySelector("#node_n"),
};

const data = {
  n: 4,
  weightlimit: 2000,
  obj: {
    0: {
      name: "apple",
      price: 400,
      weight: 150,
    },
    1: {
      name: "bananas",
      price: 1500,
      weight: 600,
    },
    2: {
      name: "strawberry",
      price: 1500,
      weight: 300,
    },
    3: {
      name: "lemon",
      price: 3000,
      weight: 850,
    },
  },
  opt: {
    val: 9400,
    sol: {
      0: 1,
      1: 0,
      2: 6,
      3: 0,
    },
  },
};

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
  DOMobj.start.addEventListener("click", function () {
    let flag = true;
    let selected = document.querySelectorAll(".choice.checked");
    let selected_id = [];
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
      calculateObj(selected_id);
    }
  });

  DOMobj.reset.addEventListener("click", function () {
    clearAlert();
    clearChoice();
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
    // calculate obj
    for (let i = 0; i < selected_id.length; i++) {
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
      DOMobj.alert.textContent = "infeasible!!";
    } else {
      // calculate gap
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
  }
}
