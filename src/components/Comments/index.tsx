/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Component } from 'react';

const Repo_Name = 'leosantanadev/desafio05-reactJS-rocketseat';

export default class Comments extends Component {
  componentDidMount() {
    const script = document.createElement('script');
    const anchor = document.getElementById('inject-comments-for-uterances');
    script.src = 'https://utteranc.es/client.js';
    script.crossOrigin = 'anonymous';
    script.async = true;
    script.setAttribute('repo', Repo_Name);
    script.setAttribute('issue-term', 'pathname');
    script.setAttribute('theme', 'github-dark');
    anchor.appendChild(script);
  }

  render() {
    return <div id="inject-comments-for-uterances" />;
  }
}
