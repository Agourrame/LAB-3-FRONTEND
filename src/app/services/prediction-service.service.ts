import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PredictionServiceService {
  apiUrl: string = 'http://127.0.0.1:5000';

  constructor(private http: HttpClient) {}

  predictStudent(features: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/predict_student`, { features });
  }

  predictEmotion(image: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', image);
    return this.http.post(`${this.apiUrl}/predict_emotion`, formData);
  }

  predictEmotionFromVideo(videoFile: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('video', videoFile, videoFile.name);

    return this.http
      .post<any>(`${this.apiUrl}/predict_emotion_video`, formData)
      .pipe(catchError(this.handleError));
  }

  predictEmotionFromImage(imageFile: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('image', imageFile, imageFile.name);

    return this.http.post<any>(`${this.apiUrl}/predict_emotion`, formData)
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    // Handle the error here
    return throwError('An error occurred while processing the video.');
  }
}
