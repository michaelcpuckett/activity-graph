
import Head from 'next/head'
import { FormEventHandler } from 'react'
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import Link from 'next/link';

export function IndexPage() {
  const handleLogInSubmit: FormEventHandler<HTMLFormElement> = event => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const { elements } = formElement;

    if (!(formElement instanceof HTMLFormElement)) {
      return;
    }

    let formElements: Array<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> = [];

    for (const element of elements) {
      if (element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement) {
        formElements.push(element);
      }
    }

    const isValid = formElements.find(element => element.checkValidity());

    if (!isValid) {
      return;
    }

    const body = Object.fromEntries(formElements.map(formElement => [
      formElement.getAttribute('name'),
      formElement.value
    ]));

    initializeApp({
      projectId: "socialweb-id",
      apiKey: "AIzaSyAqxakBaICHBJWAxfqJ3WmIoRY8LTnuwt0",
    });

    signInWithEmailAndPassword(getAuth(), body.email, body.password).then(userCredential => {
      userCredential.user.getIdToken().then(token => {
        window.document.cookie = `__session=${token}`;
        window.location.href = '/home';
      })
    });
  };

  const handleSignUpSubmit: FormEventHandler<HTMLFormElement> = event => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const { elements } = formElement;

    if (!(formElement instanceof HTMLFormElement)) {
      return;
    }

    let formElements: Array<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> = [];

    for (const element of elements) {
      if (element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement) {
        formElements.push(element);
      }
    }

    const isValid = formElements.find(element => element.checkValidity());

    if (!isValid) {
      return;
    }

    const body = Object.fromEntries(formElements.map(formElement => [
      formElement.getAttribute('name'),
      formElement.value
    ]));

    fetch(formElement.action, {
      method: 'POST',
      body: JSON.stringify(body)
    })
      .then(response => response.json())
      .then(({ error, success }: { error?: string; success?: boolean; }) => {
        if (error || !success) {
          throw new Error(error);
        }
        console.log({
          success
        })

        initializeApp({
          projectId: "socialweb-id",
          apiKey: "AIzaSyAqxakBaICHBJWAxfqJ3WmIoRY8LTnuwt0",
        });

        signInWithEmailAndPassword(getAuth(), body.email, body.password).then(userCredential => {
          userCredential.user.getIdToken().then(token => {
            console.log({
              token
            })
            window.document.cookie = `__session=${token}`;
            window.location.href = '/home';
          })
        });
      });
  };

  return (
    <>
      <Head>
        <title>ActivityWeb</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <header>
          <Link href="/home">
            {'ActivityWeb'}
          </Link>
        </header>

        <div className="card">
          <h2>
            Sign Up
          </h2>
          <form
            onSubmit={handleSignUpSubmit}
            action="/api/user"
            method="POST"
            noValidate>
            <label>
              <span>Email</span>
              <input required type="text" name="email" />
            </label>
            <label>
              <span>Password</span>
              <input required type="password" name="password" />
            </label>
            <label>
              <span>Name</span>
              <input required type="text" name="name" />
            </label>
            <label>
              <span>Username</span>
              <input required type="text" name="preferredUsername" />
            </label>
            <button type="submit">
              Sign Up
            </button>
          </form>
        </div>

        <div className="card">
          <h2>
            Log In
          </h2>
          <form
            onSubmit={handleLogInSubmit}
            action="/api/login"
            method="POST"
            noValidate>
            <label>
              <span>Username</span>
              <input required type="text" name="preferredUsername" />
            </label>
            <label>
              <span>Password</span>
              <input required type="password" name="password" />
            </label>
            <button type="submit">
              Log In
            </button>
          </form>
        </div>
      </main>
    </>
  )
}