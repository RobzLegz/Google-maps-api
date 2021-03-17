import React, { useEffect, useState } from 'react';
import storage, { db } from './private/firebase';
import firebase from "firebase";

function App() {

  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(null);
  const [image, setImage] = useState(null)
  const [images, setImages] = useState([])

  useEffect(() => {
    db.collection("media").onSnapshot((snapshot) => (
      setImages(snapshot.docs.map((doc) => ({
        id: doc.id,
        url: doc.data().url
      })))
    ))
  }, [])

  const handleChange = (e) => {
    setFile(e.target.files[0])
    const reader = new FileReader();

    reader.addEventListener("load", () => {
      setImage(reader.result)
    }, false)

    if(file){
      reader.readAsDataURL(file)
    }
  }

  const handleUpload = () => {
    const uploadTask = storage.ref(`/images/${file.name}`).put(file);
    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, (snapshot) => {
      let percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log(percent + "% done");
      setProgress(Math.floor(percent));
    }, console.error, () => {
      storage.ref(`/images/${file.name}`).getDownloadURL().then((url) => {
        setFile(null);
        setImage(url)
        console.log("Uploaded", url)
        db.collection("media").add({
          url: url,
        }).then(() => {
          setFile(null);
          setProgress(null);
          console.log("Uploaded", url)
        }).catch((err) => alert(err))
      })
      
    })
  }

  console.log(file)

  return (
    <div>
      {progress && (
        <progress id="file" max="100" value={progress} >{progress}%</progress>
      )}
      <input onChange={handleChange} type="file" />
      <button disabled={!file} onClick={handleUpload} type="submit">Upload to firebase</button>
      <img src={image} alt="image"/>
      {images.map((image) => (
        <img src={image.url} key={image.id} />
      ))}
    </div>
  )
}

export default App
