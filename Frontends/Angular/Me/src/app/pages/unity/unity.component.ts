import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

const SCRIPT_PATH = 'external/Jobs4.framework.js';
declare function createUnityInstance(canvas: any, config: any, onProgress: any): any;

@Component({
  selector: 'app-unity',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './unity.component.html',
  styleUrls: ['./unity.component.scss']
})
export class UnityComponent implements OnInit {
  private _container: HTMLElement = <HTMLElement>{};
  private _canvas: HTMLElement = <HTMLElement>{};
  private _loadingBar: HTMLElement = <HTMLElement>{};
  private _progressBarFull: HTMLElement = <HTMLElement>{};
  private _warningBanner: HTMLElement = <HTMLElement>{};

  ngOnInit(): void {
    this._container = document.querySelector("#unity-container") ?? <HTMLElement>{};
    this._canvas = document.querySelector("#unity-canvas") ?? <HTMLElement>{};
    this._loadingBar = document.querySelector("#unity-loading-bar") ?? <HTMLElement>{};
    this._progressBarFull = document.querySelector("#unity-progress-bar-full") ?? <HTMLElement>{};
    this._warningBanner = document.querySelector("#unity-warning") ?? <HTMLElement>{};

    this._loadGame();
  }


  private _updateBannerVisibility = () => {
    this._warningBanner.style.display = this._warningBanner.children.length ? 'block' : 'none';
  }


  // Shows a temporary message banner/ribbon for a few seconds, or
  // a permanent error message on top of the canvas if type=='error'.
  // If type=='warning', a yellow highlight color is used.
  // Modify or remove this function to customize the visually presented
  // way that non-critical warnings and error messages are presented to the
  // user.
  private _unityShowBanner(msg: any, type: any) {
    var div = document.createElement('div');
    div.innerHTML = `A Me solution`;
    this._warningBanner.appendChild(div);
    if (type == 'error') div.setAttribute('style', 'background: red; padding: 10px;');
    else {
      if (type == 'warning') div.setAttribute('style', 'background: yellow; padding: 10px;');
      setTimeout(() => {
        this._warningBanner.removeChild(div);
        this._updateBannerVisibility();
      }, 5000);
    }
    this._updateBannerVisibility();
  }


  private _loadGame() {
    let buildUrl = 'external'
    var config = {
      dataUrl: buildUrl + "/Jobs4.data",
      frameworkUrl: buildUrl + "/Jobs4.framework.js",
      codeUrl: buildUrl + "/Jobs4.wasm",
      streamingAssetsUrl: "StreamingAssets",
      companyName: "Myoptyx",
      productName: "Test",
      productVersion: "0.1.0",
      showBanner: this._unityShowBanner
    };

    this._loadingBar.style.display = "block";

    createUnityInstance(this._canvas, config, (progress: any) => {
      this._progressBarFull.style.width = 100 * progress + "%";
    }).then((unityInstance: any) => {
      this._loadingBar.style.display = "none";
    }).catch((message: any) => {
      alert(message);
    });
  }

}
