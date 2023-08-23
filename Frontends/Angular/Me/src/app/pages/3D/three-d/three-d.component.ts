import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit, Renderer2, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScriptService } from 'src/app/services/script/script.service';

// https://github.com/google/model-viewer/releases
const SCRIPT_PATH = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.2.0/model-viewer.min.js';

@Component({
  selector: 'app-three-d',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './three-d.component.html',
  styleUrls: ['./three-d.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ThreeDComponent implements OnInit {
  showText = signal(true);
  
  constructor(private _renderer: Renderer2,
    private _scriptService: ScriptService) { }

  ngOnInit() {
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      this.showText.set(false);
    }


    const scriptElement = this._scriptService.loadJsScript(this._renderer, SCRIPT_PATH, 'module');
    scriptElement.onload = () => {
      console.log('Google Model-Viewer script loaded');
    }
    scriptElement.onerror = () => {
      console.log('Could not load the Google Model-Viewer script');
    }
  }

}
