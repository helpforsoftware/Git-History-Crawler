const { app, BrowserWindow, ipcMain, dialog } = require('electron/main')
const path = require('node:path')
const { GitProcess, GitError, IGitResult } = require('dugite')
const { clipboard } = require('electron')
const fs= require("fs")
const {  constants } = require('node:fs/promises');
const isDev = require('electron-is-dev');
async function handleFileOpen () {
  const { canceled, filePaths } = await dialog.showOpenDialog()
  if (!canceled) {
    return filePaths[0]
  }
}

async function handleFileExists(event,filePath) {
  try {
    await fs.promises.access(filePath,constants.R_OK);
    return true;
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log('file does not exist');
      return false;
    } else {
      console.error('Error checking file existence:', err);
      throw err;
    }
  }



}
async function handleClipBoard () {
  const cliptxt =clipboard.readText()
  return cliptxt

}
async function runGitStatus (event,absoluteFilePath) {
    filePath = path.dirname(absoluteFilePath)
    fileName=path.parse(absoluteFilePath).base;
    console.log("file",fileName)
console.log(  "pathtorepository",filePath)

   //repoRoot= await getgitcommand(['rev-parse', '--show-toplevel'],pathToRepository,null)
 
  //console.log("reporoot   ",repoRoot)

  const getList= await getgitcommand(['log','--pretty=format:%H|c||%an|c||%s',fileName],filePath,null)
  //console.log("relativepath",relativePath)
  //console.log("reporoot",repoRoot.trim())
  //console.log("absoluteFilePath",absoluteFilePath)
  return getList
  }
  async function getDiff (event,hash1,hash2,absoluteFilePath) {
    filePath = path.dirname(absoluteFilePath)
    fileName=path.parse(absoluteFilePath).base;
//console.log(  "pathtorepository",filePath)

   //repoRoot= await getgitcommand(['rev-parse', '--show-toplevel'],pathToRepository,null)
 
  //console.log("reporoot   ",repoRoot)

  const diffText= await getgitcommand(['diff','-U1',hash2,hash1,fileName],filePath,null)
  //console.log("relativepath",relativePath)
  //console.log("reporoot",repoRoot.trim())
  //console.log("absoluteFilePath",absoluteFilePath)
  return diffText
  }

async function getgitcommand(gitCommand,filePath,message) {
  const result = await GitProcess.exec(gitCommand, filePath, { stdin: message })

  if (result.exitCode === 0) {
    output = result.stdout
    // do some things with the output
  } else {
    output = result.stderr
    // error handling
  }
  return output
}

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height:800,
    webPreferences: {
      webSecurity: false,
      
      preload: path.join(__dirname, 'preload.js')
    }
  })
  //mainWindow.loadFile('index.html')
  console.log("dirim bu",__dirname)

  urlem=isDev
  ? 'http://localhost:3000'
  : `file://${path.join(__dirname, './index.html')}`

console.log("urlem bnm",urlem)
  mainWindow.loadURL(urlem) ;
}

app.whenReady().then(() => {  
  ipcMain.handle('getGitStatus', runGitStatus)
  ipcMain.handle('getDiff', getDiff)
  ipcMain.handle('dialog:openFile', handleFileOpen)
  ipcMain.handle('getClipBoard', handleClipBoard) 
   ipcMain.handle('getFileExists', handleFileExists)
  createWindow()
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})