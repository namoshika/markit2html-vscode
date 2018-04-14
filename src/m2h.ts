'use strict';
import * as fs from 'fs-extra'
import * as path from 'path'
import * as vscode from 'vscode';
import m2h, { markdown } from 'markit2html';

export async function saveMarkdownAsHtml(editor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
    let md = new markdown.Md2HtmlCompiler()
    let doc = editor.document
    let txtPath = doc.fileName

    // `${mdExt.extensionPath}\\media\\markdown.css`
    // `${mdExt.extensionPath}\\media\\tomorrow.css`

    // ファイルが存在しなければエラーメッセージを表示して処理終了
    try { !await fs.statSync(txtPath) }
    catch {
        vscode.window.showErrorMessage("未保存のファイルの変換はできません")
        return
    }
    // 対象言語はMarkdownのみ
    if (doc.languageId != "markdown") {
        vscode.window.showErrorMessage("指定されたファイルはMarkdownではありません。")
        return
    }
    // htmlファイル生成
    await doc.save()
    let txt = doc.getText()
    let html = await md.compileString(txt, txtPath)
    let txtPathObj = path.parse(txtPath)
    let savePathDefault = vscode.Uri.file(path.join(txtPathObj.dir, `${txtPathObj.name}.html`))
    let savePath = await vscode.window.showSaveDialog({
        defaultUri: savePathDefault,
        filters: { "HTML": ["html"] }
    })
    if (savePath == undefined) {
        return
    }
    await fs.writeFile(savePath.fsPath, html)
}
export async function configureWorkspace() {
    try {
        let wkDir = getWorkspacePath()
        m2h.initConfig(wkDir)
    }
    catch (e) {
        if (e instanceof GetWorkspacePathError) {
            vscode.window.showErrorMessage(e.message)
        }
        else {
            vscode.window.showErrorMessage("想定されていないエラーが生じました")
        }
    }
}
export class GetWorkspacePathError extends Error {
    constructor(message: string) { super(message) }
}

// 開いているファイルのワークスペースパスを取得する
function getWorkspacePath(): string {
    let wks = vscode.workspace.workspaceFolders
    if (wks == undefined) {
        throw new GetWorkspacePathError("markit2htmlを構成可能なワークスペースが見つかりません")
    }
    if (wks.length == 1) {
        return wks[0].uri.fsPath
    }
    let editor = vscode.window.activeTextEditor
    if (editor == undefined) {
        throw new GetWorkspacePathError("ワークスペース中のファイルを開いた状態で実行してください")
    }
    let fileUri = editor.document.uri
    let wk = vscode.workspace.getWorkspaceFolder(fileUri)
    if (wk == undefined) {
        throw new Error("想定されていないエラーが発生")
    }
    return wk.uri.fsPath
}
