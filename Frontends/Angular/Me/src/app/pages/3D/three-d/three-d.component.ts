import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import "external/ajax.googleapis.com_ajax_libs_model-viewer_3.1.1_model-viewer.min.js"

@Component({
  selector: 'app-three-d',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './three-d.component.html',
  styleUrls: ['./three-d.component.scss'],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class ThreeDComponent { }
