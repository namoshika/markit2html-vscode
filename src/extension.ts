'use strict';
import * as vscode from 'vscode';
import * as m2h from './m2h'

export async function activate(context: vscode.ExtensionContext) {

    // let conf = vscode.workspace.getConfiguration()
    let mdExt = vscode.extensions.getExtension("vscode.markdown")
    if (mdExt === undefined) {
        return
    }
    context.subscriptions.push(vscode.commands.registerTextEditorCommand('markit2html.saveMarkdownAsHtml', m2h.saveMarkdownAsHtml));
    context.subscriptions.push(vscode.commands.registerCommand('markit2html.configureWorkspace', m2h.configureWorkspace));
    // context.subscriptions.push(vscode.commands.registerCommand('markit2html.initWorkspace', initWorkspace));
    // vscode.workspace.getConfiguration()
    // context.subscriptions.push(disposable); vscode.Task
}
export function deactivate() { }