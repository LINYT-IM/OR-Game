firebase.initializeApp({
  databaseURL: "https://or-game-2ef8c-default-rtdb.firebaseio.com/",
});
const cytoscape = window.cytoscape;
const TSPdatas = window.TSPdata;
let graphwidth = {
  show: document.querySelector("#cy-show").offsetWidth,
  ans: document.querySelector("#cy").offsetWidth,
};
const params = {
  style: [
    // the stylesheet for the graph
    {
      selector: "node",
      style: {
        "background-color": "black",
        label: "data(id)",
      },
    },
    {
      selector: ".highlight",
      style: {
        "line-color": "red",
      },
    },
    {
      selector: "edge",
      style: {
        width: 3,
        "line-color": "#ccc",
        // "target-arrow-color": "#ccc",
        // "target-arrow-shape": "triangle",
        "curve-style": "bezier",
      },
    },
  ],
  info_style: [
    // the stylesheet for the graph
    {
      selector: "node",
      style: {
        "background-color": "black",
        label: "data(id)",
      },
    },
    {
      selector: "edge[label]",
      css: {
        label: "data(label)",
        // "text-rotation": "autorotate",
        "text-margin-x": "0px",
        "text-margin-y": "0px",
        color: "blue",
        "text-background-color": "white",
        "text-background-opacity": 1,
        "text-background-shape": "round-rectangle",
        "text-background-padding": "5px",
      },
    },
    {
      selector: ".top-center",
      style: {
        "text-valign": "top",
        "text-halign": "left",
      },
    },
    {
      selector: "edge",
      style: {
        width: 3,
        "line-color": "#ccc",
        "curve-style": "bezier",
      },
    },
  ],
};
let node = {};
let dis = {};
let UID = "";
let res = {
  bestGap: 100,
  obj: 0,
};
const DOMobj = {
  infotb: document.querySelector(".detail-t>tbody"),
  start: document.querySelector(".start-TSP"),
  reset: document.querySelector(".reset-TSP"),
  ans: document.querySelector(".ans"),
  obj: document.querySelector(".Obj"),
  gap: document.querySelector(".Gap"),
  best: document.querySelector(".Best"),
  alert: document.querySelector(".alert"),
  uid_btn: document.querySelector("#uid-ipt"),
};
var cy = cytoscape({
  container: document.getElementById("cy"),
  style: params.style,
  userZoomingEnabled: false,
  userPanningEnabled: false,
  zoom: (1 * graphwidth["ans"]) / 800,
  pan: { x: 0, y: 10 },
});
var cy_show = cytoscape({
  container: document.getElementById("cy-show"),
  style: params["info_style"],
  userZoomingEnabled: false,
  userPanningEnabled: false,
  zoom: (0.85 * graphwidth["show"]) / 600,
  pan: { x: 0, y: 10 },
});
// 頁面顯示
{
  window.addEventListener("resize", function (event) {
    graphwidth["ans"] = document.querySelector("#cy").offsetWidth;
    graphwidth["show"] = document.querySelector("#cy-show").offsetWidth;
    cy.zoom(graphwidth["ans"] / 800);
    // cy.center();
    cy_show.zoom((0.85 * graphwidth["show"]) / 600);
    // console.log(cy.zoom());
    // console.log(cy_show.zoom());
    // cy_show.center();
    cy_show.resize();
    cy.resize();
    cy.fit();
    cy_show.fit();
  });
  const showData = function (cont) {
    for (let i = 0; i < TSPdatas["node"].length; i++) {
      let ele = TSPdatas["node"][i];
      node[ele["data"]["id"]] = [ele["position"]["x"], ele["position"]["y"]];
      cont.add(ele);
    }
    cont.nodes().lock();
  };
  showData(cy);
  showData(cy_show);
  for (let i in node) {
    for (let j in node) {
      if (i != j) {
        dis[[i, j]] =
          Math.round(
            Math.sqrt(
              Math.pow(node[i][0] - node[j][0], 2) +
                Math.pow(node[i][1] - node[j][1], 2)
            ),
            2
          ) / 100;
      }
    }
  }
}

let currnode = -1;
let currlist = [];
let edgDict = {};
// 控制單元
{
  function dataGraph(cy) {
    cy.on("click", "node", function (evt) {
      // change color
      clearEdges(cy);
      let color = "";
      if (cy.$id(this.id()).style("background-color") == "rgb(0,0,0)") {
        // clear other nodes
        for (let i = 0; i < TSPdatas["node_n"]; i++) {
          cy.$id(TSPdatas["node"][i]["data"]["id"]).style({
            "background-color": "rgb(0, 0, 0)",
          });
        }
        color = "rgb(255,0,0)";
        showRelatedGraph(cy, this.id());
        showTable(this.id());
      } else {
        color = "rgb(0,0,0)";
        closeTable();
      }
      cy.$id(this.id()).style({
        "background-color": color,
      });
    });
    // cy.on("mouseover", "node", function (evt) {
    //   // change color
    //   showRelatedGraph(cy, this.id());
    // });
    // cy.on("mouseout", "node", function (evt) {
    //   if (cy.$id(this.id()).style("background-color") == "rgb(0,0,0)") {
    //     clearEdges(cy);
    //   }
    // });
  }
  dataGraph(cy_show);
  cy.on("click", "node", function (evt) {
    if (
      !currlist.includes(this.id()) &&
      currnode != -1 &&
      currnode != this.id()
    ) {
      addEdge(cy, currnode, this.id());
      currnode = this.id();
    } else if (currlist.length == 10 && this.id() == currlist[0]) {
      // 最後連線
      addEdge(cy, currnode, this.id());
      currnode = this.id();
    } else if (currnode == -1) {
      currnode = this.id();
      currlist.push(currnode);
    }
    updateInputField();
    if (checkValid(currlist)) {
      let flag = calculateObj(currlist);
    }
  });

  DOMobj.reset.addEventListener("click", function (evt) {
    resetEdge();
  });

  function addEdge(cy, st, ed) {
    cy.add({
      group: "edges",
      data: { id: `e${currlist.length - 1}`, source: st, target: ed },
    });
    cy.on("cxttap", `e${currlist.length - 1}`, function (evt) {
      removeEdge(this.id());
      updateInputField();
    });
    cy.on("mouseover", `e${currlist.length - 1}`, function (evt) {
      cy.$id(this.id()).style({
        "line-color": "red",
        "target-arrow-color": "red",
      });
    });
    cy.on("mouseout", `e${currlist.length - 1}`, function (evt) {
      cy.$id(this.id()).style({
        "line-color": "#ccc",
        "target-arrow-color": "#ccc",
      });
    });
    edgDict[`e${currlist.length - 1}`] = [st, ed];
    currlist.push(ed);
  }

  DOMobj.ans.addEventListener("change", function (evt) {
    list_str = this.value;
    // list = [];
    currl = [];
    for (let i = 0; i < list_str.length; i++) {
      // list.push(list_str[i]);
      currl.push(list_str[i]);
    }
    DOMobj.alert.textContent = "";
    if (checkValid(currl)) {
      drawEdges(currl);
      // calculate obj
      let flag = calculateObj(currl);
    } else {
      DOMobj.alert.textContent = "!!Invalid Input!!";
    }

    currlist = currl;
    currnode = currlist[currlist.length - 1];
    updateInputField();
  });

  function containsDuplicates(array) {
    const result = array.some((element) => {
      if (array.indexOf(element) !== array.lastIndexOf(element)) {
        return true;
      }
      return false;
    });

    return result;
  }

  function checkValid(list) {
    if (list.length > 11) {
      return false;
    }
    if (list.length == 11 && list[0] == list[list.length - 1]) {
      return true;
    } else if (list.length == 11 && list[0] != list[list.length - 1]) {
      return false;
    }
    if (!containsDuplicates(list)) {
      return true;
    } else {
      return false;
    }
  }

  function removeEdge(id) {
    stn = edgDict[id][0];
    let ind = currlist.length;
    for (let i = 0; i < currlist.length; i++) {
      if (currlist[i] == stn) {
        // delete edges
        ind = i;
      }
    }
    let edg_ind = parseInt(id.replace("e", ""));
    for (const item in edgDict) {
      if (parseInt(item.replace("e", "")) >= edg_ind) {
        deleteSingleEdge(item);
      }
    }
    currlist = currlist.slice(0, ind + 1);
    currnode = currlist[currlist.length - 1];
  }

  function deleteSingleEdge(id) {
    var j = cy.$(`#${id}`);
    cy.removeListener("cxttap", j);
    cy.removeListener("mouseover", j);
    cy.removeListener("mouseout", j);
    cy.remove(j);
  }

  function resetEdge() {
    var j = cy.edges();
    cy.removeListener("cxttap", j);
    cy.removeListener("mouseover", j);
    cy.removeListener("mouseout", j);
    cy.remove(j);
    currnode = -1;
    currlist = [];
    edgDict = {};
    updateInputField();
  }

  function drawEdges(currlist) {
    resetEdge();
    for (let i = 0; i < currlist.length - 1; i++) {
      addEdge(cy, `n${currlist[i]}`, `n${currlist[i + 1]}`);
    }
  }

  function updateInputField() {
    list = "";
    for (let i = 0; i < currlist.length; i++) {
      // list.push(currlist[i]);
      list += ` ${currlist[i]},`;
    }
    // console.log(list);
    DOMobj.ans.value = list;
  }

  function showRelatedGraph(cy, id) {
    let curr = id;
    for (let i = 0; i < TSPdatas["node_n"]; i++) {
      if (id != TSPdatas["node"][i]["data"]["id"]) {
        cy.add({
          group: "edges",
          data: {
            id: `e${i}`,
            source: id,
            target: TSPdatas["node"][i]["data"]["id"],
            label: dis[[curr, TSPdatas["node"][i]["data"]["id"]]],
          },
          classes: "top-center",
        });
      }
    }
  }
  function clearEdges(cy) {
    var j = cy.edges();
    cy.remove(j);
  }

  // show detail table
  function showTable(id) {
    // generate table
    let tb = "";
    for (let i = 0; i < TSPdatas["node_n"]; i++) {
      if (TSPdatas["node"][i]["data"]["id"] != id) {
        tb += `<tr><td>${id}</td><td>${
          TSPdatas["node"][i]["data"]["id"]
        }</td><td>${dis[[id, TSPdatas["node"][i]["data"]["id"]]]}</td></tr>`;
      }
    }
    DOMobj.infotb.innerHTML = tb;
    DOMobj.infotb.parentNode.classList.remove("hidden");
  }
  function closeTable() {
    DOMobj.infotb.innerHTML = "";
    DOMobj.infotb.parentNode.classList.add("hidden");
  }

  // calculate

  DOMobj.start.addEventListener("click", function (e) {
    if (UID == "") {
      $(".mini.modal").modal("setting", "closable", false).modal("show");
    }
    DOMobj.alert.textContent = "";
    if (calculateObj(list)) {
      updateScore(UID, res["obj"], list);
    } else {
      DOMobj.obj.textContent = "*";
      DOMobj.gap.textContent = "*";
      DOMobj.alert.textContent = "!!Invalid Input!!";
    }
  });
  function checkGap(currlist) {
    list = [];
    for (let i = 0; i < currlist.length; i++) {
      list.push(currlist[i]);
    }
    if (
      list.length == 11 &&
      list[0] == list[list.length - 1] &&
      !containsDuplicates(list.slice(0, list.length - 1))
    ) {
      return true;
    } else {
      return false;
    }
  }

  $(".mini.modal").modal("setting", {
    onApprove: function () {
      // console.log(DOMobj.uid_btn);
      UID = DOMobj.uid_btn.value;
      if (UID == "" || UID == undefined) {
        DOMobj.uid_btn.parentNode.classList.add("error");
        return false;
      } else {
        updateScore(UID, res["obj"], currlist);
      }
    },
  });
  function calculateObj(list) {
    DOMobj.alert.textContent = "";
    // 計算obj值、GAP值
    let objval = 0;
    let totalweight = 0;
    let currgap = 100;
    // calculate obj
    for (let i = 0; i < list.length - 1; i++) {
      // console.log(DOMobj.quantity[selected_id[i]].value);
      objval += dis[[list[i], list[i + 1]]];
    }
    res["obj"] = objval;
    // calculate gap
    if (checkGap(list)) {
      currgap =
        Math.round(((objval - TSPdatas["Opt"]["optval"]) / objval) * 10000) /
        100;

      if (currgap < res["bestGap"]) {
        res["bestGap"] = currgap;
      }
    } else {
      currgap = "*";
      DOMobj.alert.textContent = "!!Infeasible!!";
    }
    DOMobj.best.textContent = res["bestGap"];
    DOMobj.gap.textContent = currgap;
    DOMobj.obj.textContent = objval;
    return [objval, checkGap(list)];
  }
  function updateScore(UID, objval, list) {
    if (UID == "") {
      $(".mini.modal").modal("setting", "closable", false).modal("show");
    } else {
      // console.log(UID);
      var updates = {};
      updates["/TSP/val/" + UID] = objval;
      updates["/TSP/sol/" + UID] = list;
      firebase.database().ref().update(updates);
    }
  }
}
