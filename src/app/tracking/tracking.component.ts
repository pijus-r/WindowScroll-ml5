import {Component, OnInit} from '@angular/core';

declare let ml5: any;

export interface HandposePrediction {
  annotations: Palm;
}

export interface Palm {
  indexFinger: Array<number>;
  middleFinger: Array<number>;
  palmBase: Array<number>;
  pinky: Array<number>;
  ringFinger: Array<number>;
  thumb: Array<number>;
}

@Component({
  selector: 'app-tracking',
  templateUrl: './tracking.component.html',
  styleUrls: ['./tracking.component.scss']
})
export class TrackingComponent implements OnInit {

  public handpose;
  public video;
  public predictions: Array<HandposePrediction> = [];

  public options = {
    flipHorizontal: false, // boolean value for if the video should be flipped, defaults to false
    maxContinuousChecks: Infinity, // How many frames to go without running the bounding box detector. Defaults to infinity, but try a lower value if the detector is consistently producing bad predictions.
    detectionConfidence: 0.8, // Threshold for discarding a prediction. Defaults to 0.8.
    scoreThreshold: 0.75, // A threshold for removing multiple (likely duplicate) detections based on a "non-maximum suppression" algorithm. Defaults to 0.75
    iouThreshold: 0.3, // A float representing the threshold for deciding whether boxes overlap too much in non-maximum suppression. Must be between [0, 1]. Defaults to 0.3.
  };

  private _WINDOW_CENTER = 240;


  constructor() {
  }

  ngOnInit(): void {
    this._initCamera();

    console.log('ml5 version:', ml5.version);
  }

  public _initCamera(): void {
    this.video = document.getElementById('video') as HTMLVideoElement;
    // Get access to the camera!
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({video: true})
        .then((stream) => {
          console.log('User gave video permission.');

          this.video.srcObject = stream;
          this.video.play();

          this._loadModel();
        });
    }

  }

  private _loadModel(): void {
    this.handpose = ml5.handpose(this.video, () => {
      this._initTracking();
    });
  }

  private _scrollTo(amount: number): void {
    window.scrollBy({
      top: amount,
      behavior: 'smooth',
    });
  }

  private _initTracking(): void {
    this.handpose.on('predict', (results: Array<HandposePrediction>) => {
      this.predictions = results;
      const palmPosition = this.predictions[0]?.annotations?.palmBase[0][1];

      if (palmPosition !== undefined) {
        palmPosition < this._WINDOW_CENTER ? this._scrollTo(-100) : this._scrollTo(100);
      }
    });
  }
}
