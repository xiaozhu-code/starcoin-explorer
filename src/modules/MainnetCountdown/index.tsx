import React, { PureComponent, lazy } from 'react';
// import { Redirect } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import Countdown, { zeroPad } from 'react-countdown';
import { withStyles, createStyles, Theme } from '@material-ui/core/styles';
// import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import LinearProgress from '@material-ui/core/LinearProgress';
import { getEpochData, getBarnardLatestInfo } from '@/utils/sdk';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/en';
import Timeline from '@material-ui/lab/Timeline';
import TimelineItem from '@material-ui/lab/TimelineItem';
import TimelineSeparator from '@material-ui/lab/TimelineSeparator';
import TimelineConnector from '@material-ui/lab/TimelineConnector';
import TimelineContent from '@material-ui/lab/TimelineContent';
import TimelineDot from '@material-ui/lab/TimelineDot';
import TimelineOppositeContent from '@material-ui/lab/TimelineOppositeContent';

const localizedFormat = require('dayjs/plugin/localizedFormat');

dayjs.extend(localizedFormat);

// import { getNetwork } from '@/utils/helper';
// import formatTime from '@/utils/formatTime';
// import formatNumber from '@/utils/formatNumber';
// import BlockTable from '../Blocks/components/Table';
// import TransactionTable from '../Transactions/components/Table';

const useStyles = (theme: Theme) => createStyles({
  [theme.breakpoints.down('sm')]: {
    cardContainer: {
      marginBottom: theme.spacing(1),
    },
    blocks: {
      marginBottom: theme.spacing(1),
    },
    cardHeader: {
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
    },
    searchField: {
      padding: theme.spacing(1),
    },
    title: {
      fontSize: '1.125rem',
    },
    metric: {
      paddingLeft: theme.spacing(2),
    }
  },
  [theme.breakpoints.up('sm')]: {
    cardContainer: {
      marginBottom: theme.spacing(2),
    },
    cardHeader: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
    },
    searchField: {
      padding: theme.spacing(2),
    },
    title: {
      fontSize: '1.325rem',
    },
    metric: {
      paddingLeft: theme.spacing(4),
    }
  },
  [theme.breakpoints.down('md')]: {
    blocksAndTransactions: {
      flexWrap: 'wrap',
    },
    blocks: {
      width: '100%',
      marginBottom: theme.spacing(2),
    },
    transactions: {
      width: '100%'
    },
    textFieldLabel: {
      fontSize: '0.75em'
    }
  },
  [theme.breakpoints.up('md')]: {
    blocks: {
      width: '50%',
    },
    blocksSpacer: {
      paddingRight: theme.spacing(1),
    },
    transactions: {
      width: '50%',
    },
    transactionsSpacer: {
      paddingLeft: theme.spacing(1),
    },
    textFieldLabel: {
      fontSize: '1em'
    }
  },
  root: {
    alignItems: 'center',
    display: 'flex',
    flex: '1 1 auto',
    flexGrow: 1,
  },
  cardContainer: {
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
  },
  cardHeader: {
    alignItems: 'center',
    borderBottom: '1px solid rgba(0, 0, 0, 0.075)',
    display: 'flex',
    justifyContent: 'space-between',
    paddingBottom: theme.spacing(2),
    paddingTop: theme.spacing(2),
  },

  blocksAndTransactions: {
    display: 'flex',
  },
  blocks: {
    flex: '1 1 auto',
  },
  blocksSpacer: {},
  transactionsSpacer: {},
  transactions: {
    flex: '1 1 auto',
  },
  searchField: {
    alignItems: 'center',
    display: 'flex',
    flex: '1 1 auto',
  },
  textField: {
    display: 'flex',
    flex: '1 1 auto',
    marginRight: theme.spacing(1),
  },
  textFieldLabel: {},
  button: {
    height: theme.spacing(5),
  },
  search: {
  },
  title: {
    fontWeight: 700
  },
  metric: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    borderLeft: '1px solid rgba(0, 0, 0, 0.075)',
  }
});

interface IndexProps {
  classes: any;
  t: any;
  i18n: any;
  blockList: any;
  getBlockList: (data: any, callback?: any) => any;
  transactionList: any;
  getTransactionList: (data: any, callback?: any) => any;
  pushLocation: (data: any) => any;
  location: any;
}

interface IndexState {
  value: string,
  epochData: any,
  barnardLatestInfo: any
}

class Index extends PureComponent<IndexProps, IndexState> {
  // eslint-disable-next-line react/static-property-placement
  static defaultProps = {
    blockList: null,
    getBlockList: () => { },
    transactionList: null,
    getTransactionList: () => { },
    pushLocation: () => { }
  };

  constructor(props: IndexProps) {
    super(props);
    this.state = {
      value: '',
      epochData: null,
      barnardLatestInfo: []
    };
    this.intervalFunc = this.intervalFunc.bind(this); // Here
    this.timeout = this.timeout.bind(this); // Here
  }

  componentDidMount() {
    // check redirection
    const { location } = this.props;
    if (location.state) {
      const newNetwork = location.state.network;
      localStorage.setItem('network', newNetwork);
      this.props.getBlockList({ network: 'barnard', page: 1 });
      this.props.getTransactionList({ network: 'barnard', page: 1 });
    } else {
      this.props.getBlockList({ network: 'barnard', page: 1 });
      this.props.getTransactionList({ network: 'barnard', page: 1 });
    }
    getEpochData().then(data => {
      if (data) {
        this.setState({ epochData: data });
      }
    });
    getBarnardLatestInfo().then(data => {
      if (data) {
        this.setState({ barnardLatestInfo: data });
      }
    });
    this.timeout();
  }
  
  onChange = (event: any) => {
    const { value } = event.target;
    this.setState({ value });
  };

  onSearch = () => {
    this.props.pushLocation(`/search/${this.state.value.trim()}`);
  };

  intervalFunc() {
    getBarnardLatestInfo().then(data => {
      if (data) {
        this.setState({ barnardLatestInfo: data });
        this.timeout(); // Here
      }
    });
  }

  timeout() {
    window.setTimeout(this.intervalFunc, 19000); // Here
  }

  renderCard = (
    title: string,
    url: string,
    content: any,
    cardClassName: any,
    cardSpacerClassName: any,
  ) => (
    <div className={cardClassName}>
      <div className={cardSpacerClassName}>
        <Card className={this.props.classes.card}>
          <div className={this.props.classes.cardHeader}>
            <Typography className={this.props.classes.title} variant="h4">{title}</Typography>
            <Button
              className={this.props.classes.button}
              color="primary"
              variant="contained"
              onClick={() => this.props.pushLocation(url)}
            >
              <Typography className={this.props.classes.search} variant="body1">
                {this.props.t('home.viewAll')}
              </Typography>
            </Button>
          </div>
          {content}
        </Card>
      </div>
    </div>
  );

  render() {
    const Home = lazy(() => import('../Home/adapter'));

    const { t, i18n } = this.props;

    dayjs.locale('en');

    if (i18n.language === 'zh') {
      dayjs.locale('zh-cn');
    }
    const mainnetBlock = 310000;
    let currentBlock;

    let mainnetOnline:boolean = false;
    let dateTime;
    let milliseconds;
    // let date;

    if (this.state.barnardLatestInfo !== []) {
      currentBlock = this.state.barnardLatestInfo[0];
      if (currentBlock >= mainnetBlock) {
        mainnetOnline = true;
      }
      const blockTime = this.state.barnardLatestInfo[1];
      milliseconds = (mainnetBlock - currentBlock) * blockTime;
      dateTime = new Date(Date.now() + milliseconds);
      // date = dayjs(dateTime).format('LLLL');
    }

    const Completionist = () => <span>Starcoin Main Network Launched Successfully!</span>;

    const renderer = ({
      days,
      hours,
      minutes,
      seconds,
      // milliseconds,
      completed
    }:any):any => {
      if (completed) {
        // Render a completed state
        return <Completionist />;
      }
      // Render a countdown
      return (
        <div className="classes.root">
          <Grid container spacing={3}>
            <Grid item xs={3}>
              <Paper elevation={3}>
                <div
                  className=""
                  style={{
                    fontSize: '4rem',
                    textAlign: 'center',
                    color: '#3F3F3F'
                  }}
                >
                  {days ? zeroPad(days) : '00'}
                </div>
                <div
                  style={{
                    fontSize: '1.4rem',
                    textAlign: 'center',
                    color: '#3F3F3F',
                    marginTop: '-0.5rem',
                    paddingBottom: '0.5rem'

                  }}
                >
                  { t('countdown.day') }
                </div>
              </Paper>
            </Grid>
            <Grid item xs={3}>
              <Paper elevation={3}>
                <div
                  className=""
                  style={{
                    fontSize: '4rem',
                    textAlign: 'center',
                    color: '#3F3F3F'
                  }}
                >
                  {hours ? zeroPad(hours) : '00'}
                </div>
                <div
                  style={{
                    fontSize: '1.4rem',
                    textAlign: 'center',
                    color: '#3F3F3F',
                    marginTop: '-0.5rem',
                    paddingBottom: '0.5rem'

                  }}
                >
                  { t('countdown.hour') }
                </div>
              </Paper>
            </Grid>
            <Grid item xs={3}>
              <Paper elevation={3}>
                <div
                  className=""
                  style={{
                    fontSize: '4rem',
                    textAlign: 'center',
                    color: '#3F3F3F'
                  }}
                >
                  {minutes ? zeroPad(minutes) : '00'}
                </div>
                <div
                  style={{
                    fontSize: '1.4rem',
                    textAlign: 'center',
                    color: '#3F3F3F',
                    marginTop: '-0.5rem',
                    paddingBottom: '0.5rem'

                  }}
                >
                  { t('countdown.minute') }
                </div>
              </Paper>
            </Grid>
            <Grid item xs={3}>
              <Paper elevation={3}>
                <div
                  className=""
                  style={{
                    fontSize: '4rem',
                    textAlign: 'center',
                    color: '#3F3F3F'
                  }}
                >
                  {seconds ? zeroPad(seconds) : '00'}
                </div>
                <div
                  style={{
                    fontSize: '1.4rem',
                    textAlign: 'center',
                    color: '#3F3F3F',
                    marginTop: '-0.5rem',
                    paddingBottom: '0.5rem'

                  }}
                >
                  { t('countdown.second') }
                </div>
              </Paper>
            </Grid>
          </Grid>
        </div>
      );
    };

    /*
    const Countdown = (
      <Countdown date={dateTime} renderer={renderer} />
    )
    */

    const { location } = this.props;
    const redirectNetwork = location.pathname.slice(1);
    localStorage.setItem('network', redirectNetwork);

    if (this.state.barnardLatestInfo !== []) {
      console.log('latest info:', this.state.barnardLatestInfo);
    }

    // const { t } = this.props;
    /*
    const blocksHit = blockList && blockList.hits && blockList.hits.hits ? blockList.hits.hits : [];
    const blocks = blocksHit.slice(0, 12);
    const transactionHit = transactionList && transactionList.hits ? transactionList.hits : [];
    const transactions = transactionHit.slice(0, 15);
    const metrics: any[] = [];
    if (this.state.epochData) {
      metrics.push(['Epoch', `${this.state.epochData.number}th`]);
      metrics.push([t('home.EpochStartTime'), formatTime(this.state.epochData.start_time, i18n.language)]);
      metrics.push([t('home.StartEndBlock'), `${formatNumber(this.state.epochData.start_block_number)} - ${formatNumber(this.state.epochData.end_block_number)}`]);
      metrics.push([t('home.TargetBlockTime'), formatNumber((this.state.epochData.block_time_target / 1000).toFixed(0))]);
      if (blocks && blocks.length > 0 && this.state.epochData.block_time_target > 0) {
        // const currentBlockDiff = Number(blocks[0]._source.header.difficulty);
        // const currentHashRate = formatNumber((currentBlockDiff / this.state.epochData.block_time_target * 1000).toFixed(0));
        let totalDiff = 0;
        for (let i = 0; i < blocksHit.length; i++) {
          totalDiff += blocksHit[i]._source.header.difficulty_number;
        }
        const averageBlockDiff = Number(totalDiff / blocksHit.length);
        const endTime = blocksHit[0]._source.header.timestamp;
        const startTime = blocksHit[blocksHit.length - 1]._source.header.timestamp;
        const averageBlockTime = Number((endTime - startTime) / blocksHit.length);
        const averageHashRate = formatNumber((averageBlockDiff / averageBlockTime * 1000).toFixed(0));
        metrics.push([t('home.CurrentHashRate'), averageHashRate]);
      }
    }
    */
    return (
      (!mainnetOnline) ? (
        <>
          <Grid container spacing={3} justify="center">
            <Grid item xs={8} style={{ textAlign: 'center' }}>
              <br />
              <Grid container spacing={3} justify="center">
                <Grid item xs={12} style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      fontSize: '1.6rem',
                      fontWeight: 600,
                      textAlign: 'center',
                      color: '#3F3F3F'
                    }}
                  >
                    { t('countdown.title') }
                  </div>
                </Grid>
              </Grid>
              <Grid container spacing={3} justify="center">
                <Grid item xs={12} style={{ textAlign: 'center' }}>
                  <Paper
                    elevation={3}
                    style={{
                      borderBottomLeftRadius: '0px',
                      borderBottomRightRadius: '0px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '4rem',
                        textAlign: 'center',
                        color: '#3F3F3F',
                      }}
                    >
                      { currentBlock ? (mainnetBlock - currentBlock) : 0 }
                    </div>
                  </Paper>
                  <LinearProgress
                    variant="determinate"
                    color="primary"
                    value={(currentBlock / mainnetBlock) * 100}
                    style={{
                      height: 10,
                      marginRight: '-1px',
                      marginLeft: '-1px',
                      borderBottomLeftRadius: '4px',
                      borderBottomRightRadius: '4px',
                    }}
                  />
                </Grid>
                <br />
                <Grid item xs={12} style={{ textAlign: 'left', fontSize: '1.2rem' }}>
                  <div style={{ marginBottom: '0.4rem' }}>
                    { t('countdown.barnardBlock') }<strong>{ currentBlock || 0 }</strong>
                  </div>
                  <div style={{ marginBottom: '0.4rem' }}>
                    { t('countdown.mainnetBlock') }<strong>310000</strong>
                  </div>
                  <div style={{ marginBottom: '0.4rem' }}>
                    { t('countdown.launchtime') }
                    <strong>
                      { dayjs(dateTime).isValid() ? dayjs(dateTime).format('LLLL') : t('countdown.gettime') }
                    </strong>
                  </div>
                </Grid>
              </Grid>
              {/*
              <Grid container spacing={3} justify="center">
                <Grid item xs={12} style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      fontSize: '1.6rem',
                      fontWeight: 600,
                      textAlign: 'center',
                      color: '#3F3F3F'
                    }}
                  >
                    { t('countdown.launchtime') }
                  </div>
                </Grid>
              </Grid>
              <Grid container spacing={3} justify="center">
                <Grid item xs={12} style={{ textAlign: 'center' }}>
                  <Paper
                    elevation={3}
                    style={{
                      paddingTop: '2rem',
                      paddingBottom: '2rem',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '3rem',
                        textAlign: 'center',
                        color: '#3F3F3F',
                      }}
                    >
                      { dayjs(dateTime).isValid() ? dayjs(dateTime).format('LLLL') : t('countdown.gettime') }
                    </div>
                  </Paper>
                </Grid>
              </Grid>
              */}
              <br />
              <br />
              <Grid container spacing={3} justify="center">
                <Grid item xs={12} style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      fontSize: '1.6rem',
                      fontWeight: 600,
                      textAlign: 'center',
                      color: '#3F3F3F'
                    }}
                  >
                    { t('countdown.countdown') }
                  </div>
                </Grid>
              </Grid>
              <Countdown date={dateTime} renderer={renderer} />
              <br />
              <br />
              <Grid container spacing={3} justify="center">
                <Grid item xs={12} style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      fontSize: '1.6rem',
                      fontWeight: 600,
                      textAlign: 'center',
                      color: '#3F3F3F'
                    }}
                  >
                    Starcoin { t('countdown.eventsline') }
                  </div>
                </Grid>
              </Grid>
              <Grid container spacing={3} justify="center">
                <Grid item xs={12} style={{ textAlign: 'left' }}>
                  <Paper
                    elevation={3}
                    style={{
                      paddingTop: '1rem',
                      paddingBottom: '1rem',
                    }}
                  >
                    { (i18n.language === 'en') ? (
                      <Timeline align="alternate">
                        <TimelineItem>
                          <TimelineOppositeContent>
                            <Typography color="textSecondary">2021.7.1</Typography>
                          </TimelineOppositeContent>
                          <TimelineSeparator>
                            <TimelineDot />
                            <TimelineConnector />
                          </TimelineSeparator>
                          <TimelineContent>
                            <Typography color="textSecondary">Launch Starcoin Layer 2 Project</Typography>
                          </TimelineContent>
                        </TimelineItem>
                        <TimelineItem>
                          <TimelineOppositeContent>
                            <Typography color="textSecondary">2021.6.18</Typography>
                          </TimelineOppositeContent>
                          <TimelineSeparator>
                            <TimelineDot />
                            <TimelineConnector />
                          </TimelineSeparator>
                          <TimelineContent>
                            <Typography color="textSecondary">Launch First Batch of Starcoin Move Ecosystem Projects</Typography>
                          </TimelineContent>
                        </TimelineItem>
                        <TimelineItem>
                          <TimelineOppositeContent>
                            <Typography color="textSecondary">
                              { dayjs(dateTime).isValid() ? dayjs(dateTime).format('YYYY.MM.DD, HH:mm:ss') : t('countdown.gettime') }
                            </Typography>
                          </TimelineOppositeContent>
                          <TimelineSeparator>
                            <TimelineDot color="secondary" />
                            <TimelineConnector />
                          </TimelineSeparator>
                          <TimelineContent>
                            <Typography color="textSecondary">
                              <b>Launch Starcoin Main Network</b>
                            </Typography>
                          </TimelineContent>
                        </TimelineItem>
                        <TimelineItem>
                          <TimelineOppositeContent>
                            <Typography color="textSecondary">2021.5.1-5.15</Typography>
                          </TimelineOppositeContent>
                          <TimelineSeparator>
                            <TimelineDot color="primary" />
                            <TimelineConnector />
                          </TimelineSeparator>
                          <TimelineContent>
                            <Typography>Third Round of Barnard Test Network Mining Competition Event</Typography>
                          </TimelineContent>
                        </TimelineItem>
                        <TimelineItem>
                          <TimelineOppositeContent>
                            <Typography color="textSecondary">2021.3.27-4.27</Typography>
                          </TimelineOppositeContent>
                          <TimelineSeparator>
                            <TimelineDot color="primary" />
                            <TimelineConnector />
                          </TimelineSeparator>
                          <TimelineContent>
                            <Typography>Second Round of Barnard Test Network Mining Competition Event</Typography>
                          </TimelineContent>
                        </TimelineItem>
                        <TimelineItem>
                          <TimelineOppositeContent>
                            <Typography color="textSecondary">2021.3.24-4.24</Typography>
                          </TimelineOppositeContent>
                          <TimelineSeparator>
                            <TimelineDot color="primary" />
                            <TimelineConnector />
                          </TimelineSeparator>
                          <TimelineContent>
                            <Typography>Starcoin Barnard Test Network Security Bounty Programm</Typography>
                          </TimelineContent>
                        </TimelineItem>
                        <TimelineItem>
                          <TimelineOppositeContent>
                            <Typography color="textSecondary">2021.3.27</Typography>
                          </TimelineOppositeContent>
                          <TimelineSeparator>
                            <TimelineDot color="primary" />
                            <TimelineConnector />
                          </TimelineSeparator>
                          <TimelineContent>
                            <Typography>Release Starcoin v1.0.0.beta and Launch Barnard Test Network</Typography>
                          </TimelineContent>
                        </TimelineItem>
                        <TimelineItem>
                          <TimelineOppositeContent>
                            <Typography color="textSecondary">2021.2.6</Typography>
                          </TimelineOppositeContent>
                          <TimelineSeparator>
                            <TimelineDot color="primary" />
                            <TimelineConnector />
                          </TimelineSeparator>
                          <TimelineContent>
                            <Typography>Launch Starcoin Blockchain Explorer</Typography>
                          </TimelineContent>
                        </TimelineItem>
                        <TimelineItem>
                          <TimelineOppositeContent>
                            <Typography color="textSecondary">2020.12.18-12.21</Typography>
                          </TimelineOppositeContent>
                          <TimelineSeparator>
                            <TimelineDot color="primary" />
                            <TimelineConnector />
                          </TimelineSeparator>
                          <TimelineContent>
                            <Typography>First Round of Test Network Mining Competition Event</Typography>
                          </TimelineContent>
                        </TimelineItem>
                        <TimelineItem>
                          <TimelineOppositeContent>
                            <Typography color="textSecondary">2020.8.6</Typography>
                          </TimelineOppositeContent>
                          <TimelineSeparator>
                            <TimelineDot color="primary" />
                            <TimelineConnector />
                          </TimelineSeparator>
                          <TimelineContent>
                            <Typography>Release Starcoin v0.4 and Launch Proxima Test Network</Typography>
                          </TimelineContent>
                        </TimelineItem>
                        <TimelineItem>
                          <TimelineOppositeContent>
                            <Typography color="textSecondary">2020.4.9</Typography>
                          </TimelineOppositeContent>
                          <TimelineSeparator>
                            <TimelineDot color="primary" />
                            <TimelineConnector />
                          </TimelineSeparator>
                          <TimelineContent>
                            <Typography>Release Starcoin v0.1 and Launch Halley Test Network</Typography>
                          </TimelineContent>
                        </TimelineItem>
                        <TimelineItem>
                          <TimelineOppositeContent>
                            <Typography color="textSecondary">End of 2019</Typography>
                          </TimelineOppositeContent>
                          <TimelineSeparator>
                            <TimelineDot color="primary" />
                            <TimelineConnector />
                          </TimelineSeparator>
                          <TimelineContent>
                            <Typography>Implement the Stargate Prototype，and Decide to Develop Starcoin Based on the Move Ecosystem</Typography>
                          </TimelineContent>
                        </TimelineItem>
                        <TimelineItem>
                          <TimelineOppositeContent>
                            <Typography color="textSecondary">End of 2018</Typography>
                          </TimelineOppositeContent>
                          <TimelineSeparator>
                            <TimelineDot color="primary" />
                            <TimelineConnector />
                          </TimelineSeparator>
                          <TimelineContent>
                            <Typography>Release First Version of the Starcoin Whitepaper</Typography>
                          </TimelineContent>
                        </TimelineItem>
                      </Timeline>
                    ) : (
                      <Timeline align="alternate">
                        <TimelineItem>
                          <TimelineOppositeContent>
                            <Typography color="textSecondary">2021.7.1</Typography>
                          </TimelineOppositeContent>
                          <TimelineSeparator>
                            <TimelineDot />
                            <TimelineConnector />
                          </TimelineSeparator>
                          <TimelineContent>
                            <Typography color="textSecondary">启动 Starcoin Layer 2 计划</Typography>
                          </TimelineContent>
                        </TimelineItem>
                        <TimelineItem>
                          <TimelineOppositeContent>
                            <Typography color="textSecondary">2021.6.18</Typography>
                          </TimelineOppositeContent>
                          <TimelineSeparator>
                            <TimelineDot />
                            <TimelineConnector />
                          </TimelineSeparator>
                          <TimelineContent>
                            <Typography color="textSecondary">Starcoin 第一批 Move 生态项目正式启动</Typography>
                          </TimelineContent>
                        </TimelineItem>
                        <TimelineItem>
                          <TimelineOppositeContent>
                            <Typography color="textSecondary">
                              { dayjs(dateTime).isValid() ? dayjs(dateTime).format('YYYY.MM.DD, HH:mm:ss') : t('countdown.gettime') }
                            </Typography>
                          </TimelineOppositeContent>
                          <TimelineSeparator>
                            <TimelineDot color="secondary" />
                            <TimelineConnector />
                          </TimelineSeparator>
                          <TimelineContent>
                            <Typography color="textSecondary">
                              <b>预计 Starcoin 主网上线</b>
                            </Typography>
                          </TimelineContent>
                        </TimelineItem>
                        <TimelineItem>
                          <TimelineOppositeContent>
                            <Typography color="textSecondary">2021.5.1-5月中</Typography>
                          </TimelineOppositeContent>
                          <TimelineSeparator>
                            <TimelineDot color="primary" />
                            <TimelineConnector />
                          </TimelineSeparator>
                          <TimelineContent>
                            <Typography>第三轮测试网挖矿活动</Typography>
                          </TimelineContent>
                        </TimelineItem>
                        <TimelineItem>
                          <TimelineOppositeContent>
                            <Typography color="textSecondary">2021.3.27-4.27</Typography>
                          </TimelineOppositeContent>
                          <TimelineSeparator>
                            <TimelineDot color="primary" />
                            <TimelineConnector />
                          </TimelineSeparator>
                          <TimelineContent>
                            <Typography>第二轮测试网挖矿活动</Typography>
                          </TimelineContent>
                        </TimelineItem>
                        <TimelineItem>
                          <TimelineOppositeContent>
                            <Typography color="textSecondary">2021.3.24-4.24</Typography>
                          </TimelineOppositeContent>
                          <TimelineSeparator>
                            <TimelineDot color="primary" />
                            <TimelineConnector />
                          </TimelineSeparator>
                          <TimelineContent>
                            <Typography>Starcoin 测试网安全赏金计划</Typography>
                          </TimelineContent>
                        </TimelineItem>
                        <TimelineItem>
                          <TimelineOppositeContent>
                            <Typography color="textSecondary">2021.3.27</Typography>
                          </TimelineOppositeContent>
                          <TimelineSeparator>
                            <TimelineDot color="primary" />
                            <TimelineConnector />
                          </TimelineSeparator>
                          <TimelineContent>
                            <Typography>Starcoin v1.0.0.beta 版本发布并启动 Barnard 测试网络</Typography>
                          </TimelineContent>
                        </TimelineItem>
                        <TimelineItem>
                          <TimelineOppositeContent>
                            <Typography color="textSecondary">2021.2.6</Typography>
                          </TimelineOppositeContent>
                          <TimelineSeparator>
                            <TimelineDot color="primary" />
                            <TimelineConnector />
                          </TimelineSeparator>
                          <TimelineContent>
                            <Typography>Starcoin 区块浏览器上线</Typography>
                          </TimelineContent>
                        </TimelineItem>
                        <TimelineItem>
                          <TimelineOppositeContent>
                            <Typography color="textSecondary">2020.12.18-12.21</Typography>
                          </TimelineOppositeContent>
                          <TimelineSeparator>
                            <TimelineDot color="primary" />
                            <TimelineConnector />
                          </TimelineSeparator>
                          <TimelineContent>
                            <Typography>第一轮测试网挖矿活动</Typography>
                          </TimelineContent>
                        </TimelineItem>
                        <TimelineItem>
                          <TimelineOppositeContent>
                            <Typography color="textSecondary">2020.8.6</Typography>
                          </TimelineOppositeContent>
                          <TimelineSeparator>
                            <TimelineDot color="primary" />
                            <TimelineConnector />
                          </TimelineSeparator>
                          <TimelineContent>
                            <Typography>Starcoin v0.4 版本发布并启动 Proxima 测试网络</Typography>
                          </TimelineContent>
                        </TimelineItem>
                        <TimelineItem>
                          <TimelineOppositeContent>
                            <Typography color="textSecondary">2020.4.9</Typography>
                          </TimelineOppositeContent>
                          <TimelineSeparator>
                            <TimelineDot color="primary" />
                            <TimelineConnector />
                          </TimelineSeparator>
                          <TimelineContent>
                            <Typography>Starcoin v0.1 版本发布并启动 Halley 测试网络</Typography>
                          </TimelineContent>
                        </TimelineItem>
                        <TimelineItem>
                          <TimelineOppositeContent>
                            <Typography color="textSecondary">2019年底</Typography>
                          </TimelineOppositeContent>
                          <TimelineSeparator>
                            <TimelineDot color="primary" />
                            <TimelineConnector />
                          </TimelineSeparator>
                          <TimelineContent>
                            <Typography>完成 Stargate 原型实现，并正式决定基于 Move 体系开发</Typography>
                          </TimelineContent>
                        </TimelineItem>
                        <TimelineItem>
                          <TimelineOppositeContent>
                            <Typography color="textSecondary">2018年底</Typography>
                          </TimelineOppositeContent>
                          <TimelineSeparator>
                            <TimelineDot color="primary" />
                            <TimelineConnector />
                          </TimelineSeparator>
                          <TimelineContent>
                            <Typography>发布第一版 Starcoin 白皮书</Typography>
                          </TimelineContent>
                        </TimelineItem>
                      </Timeline>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </>
      )
        : <Home />
    );
  }
}

export default withStyles(useStyles)(withTranslation()(Index));
