import React, { PureComponent, createRef } from 'react';
import { WebView as RNWebView, StyleSheet, Platform } from 'react-native';

const changeData = data => `chart.changeData(${JSON.stringify(data)});
`;

const clearData = () => `chart.clear();`;

const destoryData = () => `chart.destory();`;

const source = Platform.select({
  ios: require('./f2chart.html'),
  android: { uri: 'file:///android_asset/f2chart.html' }
});

type Props = {
  initScript: string,
  refreshProps: String,
  data?: Array<Object>,
  isPie?: Boolean,
  onChange?: Function,
  scriptFun?: Function,
  webView?: any
};

export default class Chart extends PureComponent<Props> {
  static defaultProps = {
    onChange: () => {},
    initScript: '',
    data: [],
    webView: RNWebView
  };

  constructor(props) {
    super(props);
    this.chart = createRef();
  }

  componentWillReceiveProps(nextProps) {
    const { data } = this.props;
    if (data !== nextProps.data) {
      this.update(nextProps);
    }
  }

  update = props => {
    const { isPie, scriptFun, refreshProps, data } = props;
    if (isPie && scriptFun) {
      this.chart.current.injectJavaScript(clearData(data));
      this.chart.current.injectJavaScript(scriptFun(data, props[refreshProps]));
    }
    this.chart.current.injectJavaScript(changeData(data));
  };

  componentWillUnmount = () => {
    this.chart.current.injectJavaScript(destoryData());
  };

  repaint = script => this.chart.current.injectJavaScript(script);

  onMessage = event => {
    const {
      nativeEvent: { data }
    } = event;
    const { onChange } = this.props;
    const tooltip = JSON.parse(data);
    onChange(tooltip);
  };

  render() {
    const {
      webView: WebView,
      data = [],
      onChange,
      initScript,
      ...props
    } = this.props;
    return (
      <WebView
        automaticallyAdjustContentInsets={true}
        // startInLoadingState={true}
        javaScriptEnabled={true}
        // domStorageEnabled={true}
        scalesPageToFit={true}
        ref={this.chart}
        scrollEnabled={true}
        style={styles.webView}
        injectedJavaScript={initScript}
        source={source}
        originWhitelist={['*']}
        onMessage={this.onMessage}
        {...props}
      />
    );
  }
}

const styles = StyleSheet.create({
  webView: {
    flex: 1,
    backgroundColor: 'transparent'
  }
});
