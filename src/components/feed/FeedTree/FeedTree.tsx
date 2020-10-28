import React, { useEffect, useRef } from "react";

import { PluginInstance } from "@fnndsc/chrisapi";

import { tree, select, linkVertical, stratify } from "d3";
//import './styles/FeedTree.scss'



interface ITreeProps {
  items: PluginInstance[];
  selected: PluginInstance;
}
interface ITreeActions {
  onNodeClick: (node: any) => void;
}
type AllProps = ITreeProps & ITreeActions;



const FeedTree:React.FC<AllProps>=(props)=>{
const treeRef=useRef<HTMLDivElement>(null);
const svgRef=useRef<SVGSVGElement>(null);

useEffect(() => {
  if (!!treeRef.current && !!props.items && props.items.length > 0) {
    const { items } = props;
    let dimensions = { height: 300, width: 700 }

    if(items.length===2){
      dimensions.height=100
    }
    
    select("#tree").selectAll("svg").selectAll("g").remove();

    let svg = select(svgRef.current)
      .attr("width", `${dimensions.width + 100}`)
      .attr("height", `${dimensions.height + 100}`);

    const activeNode = items.find((node) => {
      return node.data.id === props.selected.data.id;
    });

    const errorNode = items.find((node) => {
      return node.data.status === "finishedWithError";
    });

    let graph = svg.append("g").attr("transform", "translate(50,50)");

    graph.selectAll(".node").remove();
    graph.selectAll(".link").remove();
    const stratified = stratify()
      .id((d: any) => d.data.id)
      .parentId((d: any) => d.data.previous_id);
    const root = stratified(items);
    let d3TreeLayout = tree();
    d3TreeLayout.size([dimensions.width, dimensions.height]);
    d3TreeLayout(root);

    let nodeRadius = 8;

    // Nodes
    graph
      .selectAll(".node")
      .data(root.descendants())
      .join((enter) => enter.append("circle").attr("opacity", 0))
      .on("click", handleNodeClick)
      .attr("class", "node")

      .attr("id", (d: any) => {
        return `node_${d.data.data.id}`;
      })
      .attr("r", nodeRadius)
      .attr("fill", "#fff")
      .attr("cx", (node: any) => node.x)
      .attr("cy", (node: any) => node.y)
      .attr("opacity", 1);

    const linkGenerator = linkVertical()
      .x((node: any) => node.x)
      .y((node: any) => node.y);

    // Links

    graph
      .selectAll(".link")
      .data(root.links())
      .join("path")
      // @ts-ignore
      .attr("d", linkGenerator)
      // @ts-ignore
      .attr("stroke-dasharray", function () {
        // @ts-ignore
        const length = this.getTotalLength();
        return `${length} ${length}`;
      })
      .attr("stroke-dashhoffset", function () {
        // @ts-ignore
        return this.getTotalLength();
      })
      .attr("stroke-dashoffset", 0)
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke-width", 2)
      .attr("stroke", "white")
      .attr("opacity", 1);

    // labels

    graph
      .selectAll(".label")
      .data(root.descendants())
      .join("text")
      .attr("class", "label")
      .text((node: any) => node.data.data.plugin_name)
      .attr("transform", (d: any) => {
        return `translate(${d.x - nodeRadius * 4}, ${d.y + nodeRadius * 4} )`;
      })
      .attr("fill", "#fff")
      .attr("font-size", 14)
      .attr("font-weight", "bold")
      .attr("opacity", 1);

    if (activeNode) {
      const d3activeNode = select(`#node_${activeNode.data.id}`);
      if (!!d3activeNode && !d3activeNode.empty()) {
        d3activeNode.attr("class", "node active");
      }
    }

    if (errorNode) {
      const d3errorNode = select(`#node_${errorNode.data.id}`);
      if (!!d3errorNode && !d3errorNode.empty()) {
        d3errorNode.attr("class", "node error");
      }
    }
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [props.items, props.selected]);



const handleNodeClick = (node: any) => {
  props.onNodeClick(node.data);
};


return (
  <div ref={treeRef} id="tree">
    <svg className="svg-content" ref={svgRef}></svg>
  </div>
);

}

export default FeedTree;



















/*

class FeedTree extends React.Component<AllProps> {
  private treeRef = createRef<HTMLDivElement>();
  private tree?: TreeModel;

  componentDidMount() {
    const { items } = this.props;
    this.fetchTree(items);
  }

  fetchTree(items: PluginInstance[]) {
    const { selected } = this.props;
    if (!selected) return;

    if (!!this.treeRef.current && !!items && items.length > 0) {
      const treeItems = getTreeItems(items);
      const tree = getFeedTree(treeItems);
      //const tree = new TreeModel(items);

      
      if (tree.length > 0) {
        this.buildFeedTree(tree[0], this.treeRef);
      }
      

      
     /*

      if (!!tree.treeChart) {
        this.buildFeedTree(tree.treeChart, this.treeRef);
        // Set root node active on load:r
        if (tree.treeChart.nodes.length > 0) {
          const rootNode = tree.treeChart.nodes.filter(
            (node) => selected.data.id === node.item.data.id
          );
          if (rootNode[0]) this.setActiveNode(rootNode[0]);
        }
      }
    
      
    }
  }

  

  componentDidUpdate(prevProps: AllProps) {
    const { selected } = this.props;

    const prevSelected = prevProps.selected;
    if (
      prevSelected &&
      selected &&
      this.tree &&
      prevSelected.data.id !== selected.data.id
    ) {
      const activeNode = this.tree.treeChart.nodes.find(
        (node) => node.item.data.id === selected.data.id
      );
      if (activeNode) {
        this.setActiveNode(activeNode);
      }
    }

    if (prevProps.items && prevProps.items !== this.props.items) {
      d3.select("#tree").selectAll("svg").remove();
      this.fetchTree(this.props.items);
    }
  }

  render() {
    return <div ref={this.treeRef} id="tree"></div>;
  }

  // Description: set active node
  setActiveNode = (node: INode) => {
    d3.selectAll(".nodegroup.active").attr("class", "nodegroup");

    const activeNode = d3.select(`#node_${node.item.data.id}`);
    if (!!activeNode && !activeNode.empty()) {
      activeNode.attr("class", "nodegroup active");
    }
  };

  // Description: Call prop to set active node in parent state
  handleNodeClick = (node: INode) => {
    this.props.onNodeClick(node.item);
  };

  /*

  // ---------------------------------------------------------------------
  // Description: Builds Webcola/D3 Feed Tree
  buildFeedTree = (
    tree: ITreeChart,
    treeDiv: React.RefObject<HTMLDivElement>
  ) => {
    const labelMaxChar = 12;
    const width =
        !!treeDiv.current && treeDiv.current.clientWidth > 0
          ? treeDiv.current.clientWidth
          : window.innerWidth / 2 - 290,
      height = TreeNodeModel.calculateTotalTreeHeight(tree.totalRows);

    const d3cola = cola.d3adaptor(d3).avoidOverlaps(true).size([width, height]);

    const svg = d3
      .select("#tree")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const nodeRadius = 10;
    tree.nodes.forEach((v: any) => {
      v.height = v.width = 2 * nodeRadius;
      const label = `${v.item.data.plugin_name} v. ${v.item.data.plugin_version}`;
      v.label =
        label.length > labelMaxChar
          ? `${label.substring(0, labelMaxChar)}...`
          : label;
    });

    // Set up Webcola
    d3cola
      .nodes(tree.nodes)
      .links(tree.links)
      .flowLayout("y", 70)
      .symmetricDiffLinkLengths(20)
      .start(10, 15, 20);

    // Define arrow markers for tree links
    svg
      .append("svg:defs")
      .append("svg:marker")
      .attr("id", "end-arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 6)
      .attr("markerWidth", 5)
      .attr("markerHeight", 5)
      .attr("orient", "auto")
      .append("svg:path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#fff");

    // Define tree links
    const path = svg
      .selectAll(".link")
      .data(tree.links)
      .enter()
      .append("svg:path")
      .attr("class", "link");

    // Create and place the "blocks" containing the circle and the text
    const elemEnter = svg
      .selectAll("g")
      .data(tree.nodes)
      .enter()
      .append("g")
      .attr("id", (d: any) => {
        // set the node id using the plugin id
        return `node_${Number(d.item.data.id)}`;
      })
      .attr("class", "nodegroup")
      .on("click", this.handleNodeClick)
      .call(d3cola.drag);

    const label = elemEnter
      .append("text")
      .text((d: any) => {
        return d.label;
      })
      .attr("class", "nodelabel");

    // Define tree nodes
    const node = elemEnter
      .append("circle")
      .attr("class", "node")
      .attr("r", nodeRadius)
      .on("mouseover", this.handleMouseOver)
      .on("mouseout", this.handleMouseOut);

    // Move links and nodes together
    d3cola.on("tick", () => {
      // draw directed edges with proper padding from node centers
      path.attr("d", (d: any) => {
        const deltaX = d.target.x - d.source.x,
          deltaY = d.target.y - d.source.y,
          dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
          normX = deltaX / dist,
          normY = deltaY / dist,
          sourcePadding = nodeRadius + 25,
          targetPadding = nodeRadius + 10,
          sourceX = d.source.x + sourcePadding * normX,
          sourceY = d.source.y + sourcePadding * normY,
          targetX = d.target.x - targetPadding * normX,
          targetY = d.target.y - targetPadding * normY;
        return `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
      });

      // path.attr("stroke-dasharray", "5, 5") // For dashed lines
      // Position the nodes:
      node
        .attr("cx", (d: any) => {
          return d.x;
        })
        .attr("cy", (d: any) => {
          return d.y;
        });

      // Position labels and tooltip:
      label.attr("transform", (d: any) => {
        return `translate(${d.x - nodeRadius * 2}, ${d.y + nodeRadius * 2.5} )`;
      });
    }); // end of on tick
  };

  handleMouseOver = (d: any, i: number) => {
    const tooltip = document.getElementById("tooltip");
    const tooltipWidth = 200;
    if (!!tooltip) {
      const title = `Plugin Name: ${d.item.data.plugin_name}`;
      tooltip.innerHTML = title;
      const height = tooltip.offsetHeight;
      tooltip.style.width = tooltipWidth + "px";
      tooltip.style.opacity = "1";
      tooltip.style.left = d.x - tooltipWidth * 0.5 + "px";
      tooltip.style.top = d.y - (height + 25) + "px";
    }
  };

  handleMouseOut = (d: any, i: number) => {
    const tooltip = document.getElementById("tooltip");
    if (!!tooltip) {
      tooltip.innerHTML = "";
      tooltip.style.opacity = "0";
      tooltip.style.left = "-9999px";
    }
  };
 

  // Description: Destroy d3 content
  componentWillUnmount() {
    !!d3 && d3.select("#tree").remove();
  }
}
*/

