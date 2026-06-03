/**
 * TreeNT — Desktop Note & Task Organizer
 * Copyright (C) 2025  [Seu Nome]
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

'use strict'

const { app, BrowserWindow, Tray, Menu, nativeImage,
        globalShortcut, ipcMain, shell, Notification,
        dialog } = require('electron')
const path = require('path')
const fs   = require('fs')

// ── Portable mode: save data next to the .exe ────────────────
if (process.env.PORTABLE_EXECUTABLE_DIR) {
  const portableData = path.join(process.env.PORTABLE_EXECUTABLE_DIR, 'TreeNT-data')
  app.setPath('userData', portableData)
}

// ── Single-instance lock ─────────────────────────────────────
const gotLock = app.requestSingleInstanceLock()

if (!gotLock) {
  app.quit()
} else {

  let mainWindow = null
  let tray       = null
  let isQuitting = false
  let firstHide  = true
  const HOTKEY   = 'Alt+T'

  // When user tries to open a second instance, show the existing window
  app.on('second-instance', () => {
    if (!mainWindow) return
    if (!mainWindow.isVisible()) mainWindow.show()
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
  })

  // ── Window ───────────────────────────────────────────────────
  function createWindow() {
    mainWindow = new BrowserWindow({
      width: 1100, height: 720,
      minWidth: 700, minHeight: 500,
      frame: false,
      backgroundColor: '#0e0e12',
      titleBarStyle: 'hidden',
      show: false,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
      },
      icon: path.join(__dirname, 'assets', 'icon.png'),
    })
    mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'))
    mainWindow.once('ready-to-show', () => mainWindow.show())
    mainWindow.on('close', e => {
      if (!isQuitting) {
        e.preventDefault()
        mainWindow.hide()
        showBackgroundNotice()
      }
    })
  }

  // ── Background notice (first hide only) ──────────────────────
  function showBackgroundNotice() {
    if (!firstHide) return
    firstHide = false
    if (Notification.isSupported()) {
      new Notification({
        title: 'TreeNT continua em execucao',
        body:  'Acesse pelo icone na bandeja do sistema ou pressione ' + HOTKEY + '.',
        icon:  path.join(__dirname, 'assets', 'icon.png'),
      }).show()
    } else {
      dialog.showMessageBox({
        type:    'information',
        title:   'TreeNT em segundo plano',
        message: 'O aplicativo continua rodando.\nAcesse pelo icone na bandeja do sistema ou pelo atalho ' + HOTKEY + '.',
        buttons: ['Entendido'],
        icon:    path.join(__dirname, 'assets', 'icon.png'),
      })
    }
  }

  // ── Auto-start ───────────────────────────────────────────────
  function setAutoStart(enable) {
    // Portable builds: skip (exe path changes)
    if (process.env.PORTABLE_EXECUTABLE_DIR) return false
    app.setLoginItemSettings({ openAtLogin: enable, openAsHidden: true })
    tray?.setContextMenu(buildTrayMenu()) // refresh tray checkbox
    return app.getLoginItemSettings().openAtLogin
  }

  // ── Tray ─────────────────────────────────────────────────────
  function buildTrayMenu() {
    const autoStartEnabled = app.getLoginItemSettings().openAtLogin
    return Menu.buildFromTemplate([
      { label: 'Abrir TreeNT', click: toggleWindow },
      { type: 'separator' },
      {
        label: 'Sempre visivel',
        type: 'checkbox', checked: false,
        click(item) { mainWindow?.setAlwaysOnTop(item.checked) },
      },
      {
        label:   'Iniciar com o Windows',
        type:    'checkbox',
        checked: autoStartEnabled,
        click(item) { setAutoStart(item.checked) },
      },
      { type: 'separator' },
      { label: 'Sair', click() { isQuitting = true; app.quit() } },
    ])
  }

  function createTray() {
    const iconPath = path.join(__dirname, 'assets', 'tray-icon.png')
    const icon = fs.existsSync(iconPath)
      ? nativeImage.createFromPath(iconPath)
      : nativeImage.createEmpty()
    tray = new Tray(icon)
    tray.setToolTip('TreeNT  (' + HOTKEY + ' para abrir)')
    tray.setContextMenu(buildTrayMenu())
    tray.on('click', toggleWindow)
  }

  function toggleWindow() {
    if (!mainWindow) return
    if (mainWindow.isVisible()) { mainWindow.hide() }
    else { mainWindow.show(); mainWindow.focus() }
  }

  // ── Global shortcut ──────────────────────────────────────────
  function registerShortcut() {
    const ok = globalShortcut.register(HOTKEY, toggleWindow)
    if (!ok) console.warn('[TreeNT] Could not register shortcut ' + HOTKEY)
  }

  // ── IPC handlers ─────────────────────────────────────────────
  ipcMain.handle('window:minimize', () => mainWindow?.minimize())
  ipcMain.handle('window:maximize', () => {
    mainWindow?.isMaximized() ? mainWindow.unmaximize() : mainWindow?.maximize()
  })
  ipcMain.handle('window:close',    () => mainWindow?.hide())
  ipcMain.handle('window:isMax',    () => mainWindow?.isMaximized() ?? false)

  ipcMain.handle('autostart:get', () => app.getLoginItemSettings().openAtLogin)
  ipcMain.handle('autostart:set', (_e, enable) => setAutoStart(enable))

  ipcMain.handle('export:save', async (_e, { content, filename }) => {
    const { filePath } = await dialog.showSaveDialog(mainWindow, {
      defaultPath: filename,
      filters: [{ name: 'Texto', extensions: ['txt'] }],
    })
    if (filePath) { fs.writeFileSync(filePath, content, 'utf-8'); return { ok: true } }
    return { ok: false }
  })

  ipcMain.handle('shell:openExternal', (_e, url) => shell.openExternal(url))

  // ── App lifecycle ────────────────────────────────────────────
  app.whenReady().then(() => {
    createWindow()
    createTray()
    registerShortcut()
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })

  app.on('window-all-closed', () => { /* stay in tray on Windows/Linux */ })
  app.on('before-quit', () => { isQuitting = true })
  app.on('will-quit',   () => { globalShortcut.unregisterAll() })
}
