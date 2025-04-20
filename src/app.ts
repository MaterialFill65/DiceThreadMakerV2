import "./app.css";
import { CardMetaWithGroup } from "./card";
import Grid from './grid';
import GroundPicker from "./groundpicker";
import { PRESETS, PRESET_GROUPS } from "./presets";
import { domToJpeg, domToPng } from 'modern-screenshot'

/**
 * メインアプリケーション
 */
export class App {
    private readonly grid: Grid;
    private readonly presets: CardMetaWithGroup[];
    private readonly overlay: HTMLDivElement;
    private readonly menuButton: HTMLSpanElement;
    private readonly menuPanel: HTMLDivElement;
    private readonly themeToggleButton: HTMLButtonElement = document.createElement('button');
    private isMenuOpen: boolean = false;
    private currentTheme: "light" | "dark" | "system" = "system";
    private groupButtons: { [groupName: string]: HTMLDivElement } = {};
    private cardPresetButtons: { [groupName: string]: HTMLDivElement } = {};
    private readonly groupButtonContainer: HTMLDivElement = document.createElement('div');
    private readonly groupSelectorBar: HTMLDivElement = document.createElement("div");
    private readonly gridSettingsContainer: HTMLDivElement = document.createElement("div");
    private readonly clearBackgroundButton: HTMLButtonElement = document.createElement("button");
    private readonly toggleNumberVisibilityButton: HTMLButtonElement = document.createElement("button");
    private readonly exportButton: HTMLButtonElement = document.createElement("button");
    groundpicker!: GroundPicker;
    private exportPanel: HTMLDivElement | null = null;
    private progressBarContainer: HTMLDivElement | null = null;
    private progressBar: HTMLDivElement | null = null;
    private previewImageContainer: HTMLDivElement | null = null; 

    constructor(screen: HTMLDivElement) {
        this.grid = new Grid(screen);
        this.presets = PRESETS;

        // オーバーレイ
        this.overlay = document.createElement('div');
        this.overlay.id = 'overlay';
        document.body.appendChild(this.overlay);

        // メニュー
        this.menuButton = document.createElement('span');
        this.menuButton.id = 'menu-button';
        this.menuButton.textContent = 'menu';
        this.menuButton.classList.add('material-symbols-outlined');
        this.overlay.appendChild(this.menuButton);

        this.menuPanel = document.createElement('div');
        this.menuPanel.id = 'menu-panel';
        this.menuPanel.classList.add('panel');
        this.menuPanel.style.display = 'none';
        this.overlay.appendChild(this.menuPanel);

        // メニューのアイテム
        this.createMenuItems();

        // グリッド初期化
        this.grid.height = 9;
        this.grid.width = 3;

        this.presets.forEach(datum => {
            if (datum.group !== "ふつう")
                return
            this.grid.addCard(datum);
        });

        this.menuButton.addEventListener('click', this.toggleMenu.bind(this));
        screen.appendChild(this.grid.element);

        // テーマ適応
        this.applyTheme();
    }

    private createMenuItems() {
        const clearAllButton = document.createElement('button');
        clearAllButton.textContent = 'すべてのカードを消す';
        clearAllButton.addEventListener('click', this.clearAllCards.bind(this));
        this.menuPanel.appendChild(clearAllButton);

        const settingsButtons = document.createElement("div");
        settingsButtons.classList.add("setting-buttons");
        this.menuPanel.appendChild(settingsButtons);

        this.themeToggleButton.textContent = 'Toggle Theme';
        this.themeToggleButton.addEventListener('click', this.toggleTheme.bind(this));
        settingsButtons.appendChild(this.themeToggleButton);

        this.groupButtonContainer.classList.add('group-buttons-container');
        this.menuPanel.appendChild(this.groupButtonContainer);

        this.groupSelectorBar.classList.add("group-selector-bar");
        this.groupButtonContainer.appendChild(this.groupSelectorBar);

        const selectedGroup = localStorage.getItem("selectedGroup") ?? PRESET_GROUPS[0].name;

        PRESET_GROUPS.forEach((group) => {
            const groupButton = document.createElement('div');
            groupButton.classList.add('group-image-button');
            groupButton.style.background = group.color;

            const groupImage = document.createElement('img');
            groupImage.src = group.image;
            groupImage.alt = group.name;
            groupButton.appendChild(groupImage);

            groupButton.addEventListener('click', () => {
                this.selectGroup(group.name);
                this.moveSelectorBar(groupButton);
            });
            this.groupButtonContainer.appendChild(groupButton);
            this.groupButtons[group.name] = groupButton;

            if (group.name === selectedGroup) {
                this.moveSelectorBar(groupButton);
            }
        });

        PRESET_GROUPS.forEach(group => {
            const cardPresetButtonContainer = document.createElement("div");
            cardPresetButtonContainer.classList.add("preset-buttons");
            cardPresetButtonContainer.style.display = "none";
            const domparser = new DOMParser()
            this.presets.filter(preset => preset.group === group.name)
                .forEach(preset => {
                    const addPresetButton = document.createElement("div");
                    addPresetButton.classList.add("add-preset-button");
                    addPresetButton.style.background = preset.background;

                    const addPresetText = document.createElement("p");
                    addPresetText.textContent = domparser.parseFromString(preset.name, "text/html").body.textContent;
                    addPresetButton.appendChild(addPresetText);

                    addPresetButton.addEventListener("click", () => {
                        this.grid.addCard(preset);
                    });
                    cardPresetButtonContainer.appendChild(addPresetButton);
                });
            this.menuPanel.appendChild(cardPresetButtonContainer);
            this.cardPresetButtons[group.name] = cardPresetButtonContainer;
        });

        this.gridSettingsContainer.classList.add("grid-settings-container");
        this.menuPanel.appendChild(this.gridSettingsContainer);

        this.clearBackgroundButton.textContent = "背景を変更";
        this.groundpicker = new GroundPicker(this.clearBackgroundButton, this.grid.element);
        this.gridSettingsContainer.appendChild(this.clearBackgroundButton);

        this.toggleNumberVisibilityButton.textContent = "カードの数字を消す";
        this.toggleNumberVisibilityButton.addEventListener("click", this.toggleNumberVisibility.bind(this));
        this.gridSettingsContainer.appendChild(this.toggleNumberVisibilityButton);

        this.exportButton.textContent = "画像を保存";
        this.exportButton.addEventListener("click", this.showExportPanel.bind(this));
        this.gridSettingsContainer.appendChild(this.exportButton);
    }

    private moveSelectorBar(button: HTMLDivElement) {
        const buttonRect = button.getBoundingClientRect();
        const containerRect = this.groupButtonContainer.getBoundingClientRect();
        const left = buttonRect.left - containerRect.left;
        this.groupSelectorBar.style.width = `${buttonRect.width}px`;
        this.groupSelectorBar.style.transform = `translateX(${left}px)`;
    }

    private selectGroup(groupName: string) {
        localStorage.setItem("selectedGroup", groupName);
        for (const key in this.cardPresetButtons) {
            if (key === groupName) {
                this.cardPresetButtons[key].style.display = 'flex';
            } else {
                this.cardPresetButtons[key].style.display = 'none';
            }
        }
    }
    private clearAllCards() {
        if (!confirm("本当にすべてのカードを消しますか?")) {
            return;
        }
        this.grid.removeAllCards();
    }

    private toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
        this.menuPanel.style.display = this.isMenuOpen ? 'flex' : 'none';
        if (this.isMenuOpen) {
            this.menuButton.textContent = "close";
            const selectedGroup = localStorage.getItem("selectedGroup");
            if (selectedGroup) {
                this.selectGroup(selectedGroup);
            } else {
                this.selectGroup(PRESET_GROUPS[0].name);
            }
        } else {
            this.menuButton.textContent = "menu";
        }
        if (!this.isMenuOpen) {
            for (const key in this.cardPresetButtons) {
                this.cardPresetButtons[key].style.display = 'none';
            }
        }
    }

    private toggleTheme() {
        if (this.currentTheme === 'light') {
            this.currentTheme = 'dark';
        } else if (this.currentTheme === 'dark') {
            this.currentTheme = 'system';
        } else {
            this.currentTheme = 'light';
        }

        localStorage.setItem('theme', this.currentTheme);
        this.applyTheme();
    }

    private applyTheme() {
        const root = document.documentElement;
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            this.currentTheme = savedTheme as 'light' | 'dark' | 'system';
        }

        root.classList.remove('light-theme', 'dark-theme');

        if (this.currentTheme === 'light') {
            root.classList.add('light-theme');
            this.themeToggleButton.textContent = 'ライトモード';
        } else if (this.currentTheme === 'dark') {
            root.classList.add('dark-theme');
            this.themeToggleButton.textContent = 'ダークモード';
        } else {
            this.themeToggleButton.textContent = 'システムに準拠';
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                root.classList.add('dark-theme');
            } else {
                root.classList.add('light-theme');
            }
        }
    }

    private toggleNumberVisibility() {
        this.grid.toggleNumberVisibility();
        if (this.toggleNumberVisibilityButton.textContent === "カードの数字を消す") {
            this.toggleNumberVisibilityButton.textContent = "カードの数字を表示する";
        } else {
            this.toggleNumberVisibilityButton.textContent = "カードの数字を消す";
        }
    }

    /**
     *  PNGとしてエクスポート
     * @param scale HTML要素のサイズを調整することでいい感じに解像度を高くする
     * @returns base64エンコード済み画像リンク
     */
    private async exportAsPng(scale: number) {
        return await this.exportWithProgress(scale, async (context) => {
            return await domToPng(this.grid.element, context);
        });
    }

    /**
     *  JPEGとしてエクスポート
     * @param scale HTML要素のサイズを調整することでいい感じに解像度を高くする
     * @param quality JPEGの品質。1になればなるほど良い
     * @returns base64エンコード済み画像リンク
     */
    private async exportAsJpeg(scale: number, quality: number) {
        return await this.exportWithProgress(scale, async (context) => {
            context.quality = quality;
            return await domToJpeg(this.grid.element, context);
        });
    }

    private async exportWithProgress(scale: number, exportFunc: (context: any) => Promise<string>) {
        this.createProgressBar();
        try {
            const result = await exportFunc({
                node: this.grid.element,
                features: {
                    fixSvgXmlDecode: true
                },
                style: {
                    position: "static",
                    transformOrigin: "0px 0px",
                    scale: "1"
                },
                scale: scale,
                width: Number.parseInt(this.grid.element.style.width.replace("px", "")),
                height: Number.parseInt(this.grid.element.style.height.replace("px", "")),
                progress: (current: number, total: number) => {
                    this.updateProgressBar(current, total);
                }
            });
            return result;
        } catch (e) {
            console.error(e);
            alert("画像の作成に失敗しました。");
            return null;
        } finally {
            this.removeProgressBar();
        }
    }

    private createProgressBar() {
        if (this.progressBarContainer) return;

        this.progressBarContainer = document.createElement("div");
        this.progressBarContainer.id = "progress-bar-container";

        this.progressBar = document.createElement("div");
        this.progressBar.id = "progress-bar";
        this.progressBarContainer.appendChild(this.progressBar);

        if (this.previewImageContainer) {
            this.previewImageContainer.appendChild(this.progressBarContainer);
        } else {
            this.overlay.appendChild(this.progressBarContainer);
        }
    }

    private updateProgressBar(current: number, total: number) {
        if (!this.progressBar) return;
        const percentage = (current / total) * 100;
        this.progressBar.style.width = `${percentage}%`;
    }

    private removeProgressBar() {
        if (this.progressBarContainer) {
            this.progressBarContainer.remove();
            this.progressBarContainer = null;
            this.progressBar = null;
        }
    }

    private showExportPanel() {
        if (this.exportPanel) {
            this.exportPanel.remove();
            this.exportPanel = null;
        }

        this.exportPanel = document.createElement("div");
        this.exportPanel.id = "export-panel";
        this.exportPanel.classList.add("edit-modal", "panel");
        const gridWidth = this.grid.element.style.width.replace("px", "");
        const gridHeight = this.grid.element.style.height.replace("px", "");
        this.exportPanel.innerHTML = `
            <h1>画像のエクスポート設定</h1>
            <div class="export-settings">
                <label for="export-type">形式:</label>
                <select id="export-type">
                    <option value="jpeg">JPEG</option>
                    <option value="png">PNG</option>
                </select>
                <label for="export-quality">品質 (JPEGのみ):</label>
                <div class="input-container">
                    <input type="range" id="export-quality" min="0" max="1" step="0.1" value="0.9">
                    <span id="quality-value">0.9</span>
                </div>

                <label for="export-scale">スケール:</label>
                <div class="input-container">
                    <input type="range" id="export-scale" min="1" max="2" step="0.1" value="1.0">
                    <span id="scale-value">1.0</span>
                </div>
            </div>
            <div class="export-preview" style="max-width: 60svw; max-height: 60svh; aspect-ratio: ${gridWidth} / ${gridHeight}; height: ${gridHeight}px">
                <img id="export-preview-image" src="" alt="プレビュー" style="max-width: 60svw; max-height: 60svh; aspect-ratio: ${gridWidth} / ${gridHeight};"/>
            </div>
            <div class="export-buttons">
                <button id="download-button" class="export-button">保存</button>
                <button id="close-export-panel-button" class="export-button">閉じる</button>
            </div>
        `;
        this.overlay.appendChild(this.exportPanel);

        this.previewImageContainer = this.exportPanel.querySelector(".export-preview"); // Add this line

        const closePanelButton = this.exportPanel.querySelector("#close-export-panel-button") as HTMLButtonElement;
        closePanelButton.addEventListener("click", () => {
            this.exportPanel?.remove();
            this.exportPanel = null;
        });

        const qualityInput = this.exportPanel.querySelector("#export-quality") as HTMLInputElement;
        const qualityValue = this.exportPanel.querySelector("#quality-value") as HTMLSpanElement;
        qualityInput.addEventListener("input", () => {
            if (qualityInput.value.indexOf(".") == -1) {
                qualityValue.textContent = qualityInput.value + ".0";
            } else {
                qualityValue.textContent = qualityInput.value
            }
        });

        const scaleInput = this.exportPanel.querySelector("#export-scale") as HTMLInputElement;
        const scaleValue = this.exportPanel.querySelector("#scale-value") as HTMLSpanElement;
        scaleInput.addEventListener("input", () => {
            if (scaleInput.value.indexOf(".") == -1) {
                scaleValue.textContent = scaleInput.value + ".0";
            } else {
                scaleValue.textContent = scaleInput.value
            }
        });

        const downloadButton = this.exportPanel.querySelector("#download-button") as HTMLButtonElement;
        downloadButton.addEventListener("click", this.handleDownload.bind(this));

        this.updatePreview();

        const exportTypeSelect = this.exportPanel.querySelector("#export-type") as HTMLSelectElement;
        const exportScaleInput = this.exportPanel.querySelector("#export-scale") as HTMLInputElement;
        exportTypeSelect.addEventListener("change", this.updatePreview.bind(this));
        exportScaleInput.addEventListener("change", this.updatePreview.bind(this));
        qualityInput.addEventListener("change", this.updatePreview.bind(this));
        scaleInput.addEventListener("change", this.updatePreview.bind(this));
    }

    private async updatePreview() {
        const exportTypeSelect = this.exportPanel?.querySelector("#export-type") as HTMLSelectElement;
        const exportScaleInput = this.exportPanel?.querySelector("#export-scale") as HTMLInputElement;
        const qualityInput = this.exportPanel?.querySelector("#export-quality") as HTMLInputElement;
        const previewImage = this.exportPanel?.querySelector("#export-preview-image") as HTMLImageElement;

        if (!exportTypeSelect || !exportScaleInput || !previewImage || !qualityInput) return;

        const type = exportTypeSelect.value;
        const scale = parseFloat(exportScaleInput.value);
        const quality = parseFloat(qualityInput.value);

        let dataUrl: string | null = null;
        if (type === "png") {
            dataUrl = await this.exportAsPng(scale);
        } else if (type === "jpeg") {
            dataUrl = await this.exportAsJpeg(scale, quality);
        }

        // Fileに変換
        if (dataUrl) {
            const blob = await fetch(dataUrl).then(r => r.blob());
            if(type === "png"){
                const file = new File([blob], "dice-thread-image.png", { type: "image/png" });
                previewImage.src = URL.createObjectURL(file);
            }else if (type === "jpeg"){
                const file = new File([blob], "dice-thread-image.jpg", { type: "image/jpeg" });
                previewImage.src = URL.createObjectURL(file);
            }
        }
    }

    private async handleDownload() {
        const exportTypeSelect = this.exportPanel?.querySelector("#export-type") as HTMLSelectElement;
        const type = exportTypeSelect.value;
        
        const previewImage = this.exportPanel?.querySelector<HTMLImageElement>("#export-preview-image");

        if (previewImage) {
            const link = document.createElement('a');
            link.href = previewImage.src;
            if(type === "png"){
                link.download = "dice-thread-image.png";
            }else if (type === "jpeg"){
                link.download = "dice-thread-image.jpg";
            }
            link.click();
            this.exportPanel!.remove();
            this.exportPanel = null;
        }
    }
}
