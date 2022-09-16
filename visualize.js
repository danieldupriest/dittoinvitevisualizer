const config = require('./config.js');
const mysql = require('mysql');
const util = require('util');
const fs = require('fs');
const { Canvas, Field, Table, TreeNode } = require('./tree.js');

const tableToVisualize = 'users';
const foreignKey = 'invitingUserId';

function makeDb(config) {
  const connection = mysql.createConnection(config);

  return {
    config,
    query(sql) {
      return util.promisify(connection.query).call(connection ,sql, []);
    },
    close() {
      return util.promisify(connection.end).call(connection);
    }
  }
}

async function buildTrees(db) {
  const users = await db.query(`SELECT id, firstName, lastName, ${foreignKey} ` +
  `FROM ${tableToVisualize};`);

  const nodes = [];

  // Generate nodes
  for (const user of Object.values(users)) {
    if(!user.firstName && !user.lastName) continue;
    nodes[user.id] = new Field(user.firstName + ' ' + user.lastName);
  }
  
  // Connect nodes
  for (const user of Object.values(users)) {
    if(!user.firstName && !user.lastName) continue;
    
    if (user.invitingUserId) {
      const currentNode = nodes[user.id];
      nodes[user.invitingUserId].addChild(currentNode);
      currentNode.setParent(nodes[user.invitingUserId]);
    }
  }

  // Find tree roots to render
  const trees = [];

  for (let i = 0; i < nodes.length; i++) {
    const total = nodes.length;
    const node = nodes[i];
    console.log(`Processing node ${i+1} of ${total} total...`);
    if(!node) continue;
    const parent = node.findRoot();
    if (parent && !trees.includes(parent)) trees.push(parent);
  }

  return trees;
}

const main = async() => {
  const db = makeDb(config.db);
  const trees = await buildTrees(db);
  const treeText = [];
  const total = trees.length;

  for (let i = 0; i < total; i++) {
    const tree = trees[i];
    console.log(`Rendering tree ${i+1} of ${total}...`);
    const canvas = new Canvas();
    const output = tree.render(canvas);
    treeText.push(output.toString());
  }

  fs.writeFile('./output.txt', treeText.join('\n\n'), err => {
    if (err) console.error(err);
  });

  console.log("Text output saved to 'output.txt'.");

  await db.close();
}

main();
