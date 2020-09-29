/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useRef, useState } from 'react';
import './App.css';
import deleteBtn from './delete.png' ;

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/analytics';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  // Put your app data
})

const auth = firebase.auth();
const firestore = firebase.firestore();


function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>⚛️🔥💬</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}

function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <div className='signInBlock'>
      <button id="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
    </div>
  )

}

function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}


function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');


  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser;
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  const deleteMsg = async (id) => {
    try {
      await firebase.firestore().collection('messages').doc(id).delete();
    } catch (error) {
      if(String(error).includes('permission')){
        console.log(`You can't delete the message`);
      }
    }
  }


  return (<>
    <main>

      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} deleteMsg={deleteMsg}/>)}
      
      <span ref={dummy}></span>

    </main>

    <form onSubmit={sendMessage}>

      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice" />

      <button id="send" type="submit" disabled={!formValue}>🕊️</button>

    </form>
  </>)
}


function ChatMessage(props) {
  const { text, uid, photoURL, id } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';
  
  return (<>
    <div className={`message ${messageClass}`}>      
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />
      <p>{text}</p>
      {
        uid === auth.currentUser.uid ? <button id="deleteBtn" onClick={() => {console.log(id); props.deleteMsg(id)}}><img id='delete' src={deleteBtn}/></button> : ''
      }
    </div>
  </>)
}


export default App;
