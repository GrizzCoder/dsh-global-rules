// dsh-global-rules client bundle: registers a "全局规则" settings section.
window.__ModuleLoader__.load({ id: "dsh-global-rules", factory: (require) => {

		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		const h = react.createElement;
		const { useState, useEffect, useCallback } = react;

		const NS = "global-rules";
		const inject = ["slots", "locale"];

		const API_PATH = "/api/global-rules";
		const REVEAL_API_PATH = "/api/global-rules/reveal";
		const DEFAULT_PATH_LABEL = "~/.dsh/AGENTS.md";

		const DICTS = {
			zh: {
				label: "全局规则",
				headerTitle: "全局规则",
				desc: "编辑 {path} 全局规则，保存后每轮对话自动加载",
				notExists: "文件尚不存在，保存将创建它。",
				loading: "加载中…",
				placeholder: "# 全局规则\n\n在这里编写对每个会话生效的指令…",
				openFolder: "打开所在目录",
				openingFolder: "打开中…",
				save: "保存",
				saving: "保存中…",
				cancel: "取消",
				readError: "读取失败: {error}",
				saved: "已保存。新会话立即生效；当前会话将在下一次文件操作后感知新规则。",
				saveError: "保存失败: {error}",
				unknownError: "未知错误",
				authFailed: "会话未通过鉴权，请刷新页面后重试",
			},
			en: {
				label: "Global Rules",
				headerTitle: "Global Rules",
				desc: "Edit {path} global rules, auto-loaded every round after saving",
				notExists: "File does not exist yet; saving will create it.",
				loading: "Loading…",
				placeholder: "# Global Rules\n\nWrite instructions here that take effect across every session…",
				openFolder: "Show in Folder",
				openingFolder: "Opening…",
				save: "Save",
				saving: "Saving…",
				cancel: "Cancel",
				readError: "Failed to read: {error}",
				saved: "Saved. New sessions take effect immediately; current session will detect new rules after the next file operation.",
				saveError: "Failed to save: {error}",
				unknownError: "Unknown error",
				authFailed: "Session authentication failed, please refresh the page and try again",
			},
		};

		function failureCode(res) {
			return (res.status === 401 || res.status === 403) ? "authFailed" : ("HTTP " + res.status);
		}

		const TEXTAREA_STYLE = {
			width: "100%",
			minHeight: "360px",
			boxSizing: "border-box",
			fontFamily: "ui-monospace, 'Cascadia Mono', Consolas, monospace",
			fontSize: "13px",
			lineHeight: 1.5,
			padding: "12px",
			background: "transparent",
			color: "inherit",
			border: "0.5px solid var(--dsw-alias-border-l4)",
			borderRadius: "var(--dsw-radius-md)",
			resize: "vertical",
		};

		const HEADER_ROW_STYLE = {
			display: "flex",
			alignItems: "center",
			justifyContent: "space-between",
			gap: "12px",
			marginBottom: "12px",
		};

		const ROW_STYLE = {
			display: "flex",
			alignItems: "center",
			justifyContent: "flex-end",
			gap: "10px",
			marginTop: "12px",
		};

		const BUTTON_CSS = [
			".dgr-btn {",
			"  box-sizing: border-box;",
			"  display: inline-flex;",
			"  align-items: center;",
			"  justify-content: center;",
			"  gap: 4px;",
			"  height: 36px;",
			"  padding: 0 16px;",
			"  border-radius: var(--dsw-radius-md);",
			"  cursor: pointer;",
			"  font-size: 14px;",
			"  line-height: 22px;",
			"  transition: all 0.2s;",
			"}",
			".dgr-cancel {",
			"  border: 1px solid var(--dsw-alias-border-l3);",
			"  background: transparent;",
			"  color: inherit;",
			"}",
			".dgr-cancel:hover:not(:disabled) {",
			"  background: var(--dsw-alias-fill-hover);",
			"}",
			".dgr-save {",
			"  border: none;",
			"  background: var(--dsw-alias-button-primary-fill);",
			"  color: var(--dsw-alias-label-primary-foreground);",
			"}",
			".dgr-save:hover:not(:disabled) {",
			"  background: var(--dsw-alias-button-primary-hover);",
			"}",
			".dgr-btn:disabled {",
			"  cursor: not-allowed;",
			"  opacity: 0.4;",
			"}",
			".dgr-open-folder {",
			"  height: 30px;",
			"  padding: 0 10px;",
			"  font-size: 12px;",
			"  white-space: nowrap;",
			"  flex-shrink: 0;",
			"}",
		].join("\n");

		function GlobalRulesSection(props) {
			const t = props.t;
			const [content, setContent] = useState("");
			const [savedContent, setSavedContent] = useState("");
			const [loaded, setLoaded] = useState(false);
			const [exists, setExists] = useState(true);
			const [pathLabel, setPathLabel] = useState(DEFAULT_PATH_LABEL);
			const [saving, setSaving] = useState(false);
			const [opening, setOpening] = useState(false);
			const [notice, setNotice] = useState({ kind: "idle" });

			const loadData = useCallback(() => {
				fetch(API_PATH, { cache: "no-store" })
					.then((res) => {
						if (!res.ok) throw new Error(failureCode(res));
						return res.json();
					})
					.then((data) => {
						const val = String(data.content || "");
						setContent(val);
						setSavedContent(val);
						setExists(Boolean(data.exists));
						setPathLabel(String(data.path || DEFAULT_PATH_LABEL));
						setLoaded(true);
					})
					.catch((error) => {
						setNotice({ kind: "error", key: "readError", errorParam: error.message });
						setLoaded(true);
					});
			}, []);

			useEffect(() => {
				loadData();
			}, [loadData]);

			const save = useCallback(() => {
				setSaving(true);
				setNotice({ kind: "idle" });
				fetch(API_PATH, {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({ content }),
				})
					.then(async (res) => {
						const data = await res.json().catch(() => ({}));
						if (!res.ok) throw new Error(data.error || failureCode(res));
						return data;
					})
					.then((data) => {
						if (data.ok) {
							setExists(true);
							setSavedContent(content);
							setNotice({ kind: "ok", key: "saved" });
						} else {
							setNotice({ kind: "error", key: "saveError", errorParam: data.error });
						}
					})
					.catch((error) => {
						setNotice({ kind: "error", key: "saveError", errorParam: error.message });
					})
					.finally(() => setSaving(false));
			}, [content]);

			const cancel = useCallback(() => {
				setContent(savedContent);
				setNotice({ kind: "idle" });
			}, [savedContent]);

			const openFolder = useCallback(() => {
				setOpening(true);
				fetch(REVEAL_API_PATH, {
					method: "POST",
					headers: { "content-type": "application/json" },
				})
					.catch(() => {})
					.finally(() => setOpening(false));
			}, []);

			const resolveErrorText = (param) => {
				if (!param) return t("unknownError");
				return param === "authFailed" ? t("authFailed") : param;
			};

			return h("div", { style: { maxWidth: "760px", padding: "8px 0" } },
				h("style", null, BUTTON_CSS),
				h("h2", { style: { fontSize: "18px", fontWeight: 600, margin: "0 0 8px 0" } }, t("headerTitle")),
				h("div", { style: HEADER_ROW_STYLE },
					h("p", { style: { margin: 0, opacity: 0.75, fontSize: "13px", wordBreak: "break-all" } },
						t("desc", { path: pathLabel })),
					h("button", {
						className: "dgr-btn dgr-cancel dgr-open-folder",
						disabled: opening,
						onClick: openFolder,
						title: pathLabel,
					}, opening ? t("openingFolder") : t("openFolder")),
				),
				exists ? null : h("p", { style: { color: "inherit", opacity: 0.75, fontSize: "13px", marginTop: "-4px" } },
					t("notExists")),
				!loaded ? h("p", { style: { opacity: 0.6 } }, t("loading")) : h("textarea", {
					style: TEXTAREA_STYLE,
					value: content,
					onChange: (event) => setContent(event.target.value),
					spellCheck: false,
					placeholder: t("placeholder"),
				}),
				h("div", { style: ROW_STYLE },
					notice.kind === "ok" ? h("span", { style: { marginRight: "auto", fontSize: "13px", color: "inherit", opacity: 0.85 } }, t(notice.key))
						: notice.kind === "error" ? h("span", { style: { marginRight: "auto", fontSize: "13px", color: "var(--dsw-alias-state-error-primary)" } }, t(notice.key, { error: resolveErrorText(notice.errorParam) }))
						: h("span", { style: { marginRight: "auto" } }),
					h("button", {
						className: "dgr-btn dgr-cancel",
						disabled: saving || content === savedContent,
						onClick: cancel,
					}, t("cancel")),
					h("button", {
						className: "dgr-btn dgr-save",
						disabled: saving,
						onClick: save,
					}, saving ? t("saving") : t("save")),
				),
			);
		}

		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, DICTS), "global-rules: dictionaries");
			const t = ctx.locale.bind(NS);
			ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "global-rules",
				order: 30,
				locale: NS,
				label: () => t("label"),
			}, GlobalRulesSection));
		}

		exports.name = NS;
		exports.inject = inject;
		exports.apply = apply;
		exports.DICTS = DICTS;
		return module.exports;
	}
});
