import { AfterViewInit, Component, ElementRef, Inject, Input, OnDestroy, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { PredictionServiceService } from './services/prediction-service.service';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { Observable, Subject, Subscription, interval, switchMap } from 'rxjs';
import { WebcamImage, WebcamInitError } from 'ngx-webcam';

interface emotion{
  emotion:string;
  result:number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements AfterViewInit,OnInit,OnDestroy  {
  emotionPrediction: any;
  emotionLabels: string[] = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral'];
  highestEmotion: emotion[]=[];


  array=[];
  img:string='';

  private video!: HTMLVideoElement;
  public emotionResult!: any;
  private stream!: MediaStream;

  ngAfterViewInit() {
    
  }

  selectedVideo: File | null = null;
  predictionResult: any;

  // @ViewChild('videoElement', { static: true }) videoElement!: ElementRef<HTMLVideoElement>;
  // @Input() width: number = 640; // Default width
  // @Input() height: number = 480; // Default height

  constructor(private predictionService: PredictionServiceService,@Inject(PLATFORM_ID) private platformId: Object) { }


  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.stopWebcam();
    }
  }


  ngOnInit() {
   // this.setupCamera();
   if (isPlatformBrowser(this.platformId)) {
    this.video = document.createElement('video');
    this.video.width = 640;
    this.video.height = 480;
    this.video.autoplay = true;
    this.startWebcam();
    this.captureFrames();
  }
  }

  // async setupCamera() {
  //   try {
  //     const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  //     this.videoElement.nativeElement.srcObject = stream;
  //     this.videoElement.nativeElement.width = this.width;
  //     this.videoElement.nativeElement.height = this.height;
  //   } catch (error) {
  //     console.error('Error accessing camera: ', error);
  //   }
  // }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () =>{
        const base64String = reader.result as string;
        this.img = base64String+'';
        console.log(base64String+'')
      }
      reader.readAsDataURL(file);
      this.predictEmotion(file);
      
    }
  }

  predictEmotion(image: File) {
    this.predictionService.predictEmotion(image)
    .subscribe(data => {
      console.log(data)
      //this.array=[];
      this.emotionPrediction=[];
      this.highestEmotion=[];
      
      let index=0;
      this.emotionPrediction = data.prediction;
      
      // console.log(this.emotionPrediction)

      
        this.highestEmotion.push({emotion:this.emotionLabels[0],result:this.emotionPrediction.Angry})
        this.highestEmotion.push({emotion:this.emotionLabels[1],result:this.emotionPrediction.Disgust})
        this.highestEmotion.push({emotion:this.emotionLabels[2],result:this.emotionPrediction.Fear})
        this.highestEmotion.push({emotion:this.emotionLabels[3],result:this.emotionPrediction.Happy})
        this.highestEmotion.push({emotion:this.emotionLabels[4],result:this.emotionPrediction.Neutral})
        this.highestEmotion.push({emotion:this.emotionLabels[5],result:this.emotionPrediction.Sad})
        this.highestEmotion.push({emotion:this.emotionLabels[6],result:this.emotionPrediction.Surprise})

      //  this.emotionPrediction.map((ele:any)=>{
      //   //this.highestEmotion.push({emotion:this.emotionLabels[index],result:ele})
      //   this.array=ele;
      //  })

      //  this.array.map((ele)=>{
      //   this.highestEmotion.push({emotion:this.emotionLabels[index++],result:ele})
      //  })
      

     // this.highestEmotion
    });
  }

  onVideoSelected(event: any): void {
    this.selectedVideo = event.target.files[0];
  }

  onSubmit(): void {
    if (this.selectedVideo) {
      this.predictionService.predictEmotionFromVideo(this.selectedVideo)
        .subscribe(
          result => {
            this.predictionResult = result;
            console.log('Prediction Result:', this.predictionResult);
          },
          error => {
            console.error('Error:', error);
          }
        );
    }
  }


  private startWebcam(): void {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        this.stream = stream;
        this.video.srcObject = stream;
        document.body.appendChild(this.video);
      })
      .catch(error => {
        console.error('Error accessing webcam:', error);
      });
  }

  private stopWebcam(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
    if (this.video) {
      document.body.removeChild(this.video);
    }
  }

  private captureFrames(): void {
    setInterval(() => {
      const canvas = document.createElement('canvas');
      canvas.width = this.video.width;
      canvas.height = this.video.height;
      const context = canvas.getContext('2d');
      if(context)
      context.drawImage(this.video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => {
        if (blob) {
          const imageFile = new File([blob], 'frame.jpg');
          this.sendImageToServer(imageFile);
        }
      }, 'image/jpeg');
    }, 1000); // Capture a frame every second
  }

  private sendImageToServer(imageFile: File): void {
    this.predictionService.predictEmotionFromImage(imageFile).subscribe(
      result => {
      this.emotionResult = result;
      this.emotionPrediction=[];
      this.highestEmotion=[];
      
      this.emotionPrediction = result.prediction;
      
      this.highestEmotion.push({emotion:this.emotionLabels[0],result:this.emotionPrediction.Angry})
      this.highestEmotion.push({emotion:this.emotionLabels[1],result:this.emotionPrediction.Disgust})
      this.highestEmotion.push({emotion:this.emotionLabels[2],result:this.emotionPrediction.Fear})
      this.highestEmotion.push({emotion:this.emotionLabels[3],result:this.emotionPrediction.Happy})
      this.highestEmotion.push({emotion:this.emotionLabels[4],result:this.emotionPrediction.Neutral})
      this.highestEmotion.push({emotion:this.emotionLabels[5],result:this.emotionPrediction.Sad})
      this.highestEmotion.push({emotion:this.emotionLabels[6],result:this.emotionPrediction.Surprise})


      },
      error => {
        console.error('Error:', error);
      }
    );
  }

 
}
