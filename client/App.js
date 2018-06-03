import React, { Component, Fragment } from 'react';
import logo from './images/SAS-Logo-white.png';
import { Layout, Menu, Icon, Button, Form, Divider, Row, Col } from 'antd';
import './css/App.css';
import { Route, Switch } from "react-router-dom";
import NotFound from "./components/NotFound";
import Login from "./components/Login";
import VacationPeriods from "./components/VacationPeriods";
import Staff from "./components/Staff";
import Applications from "./components/Applications";
import MyVacations from "./components/MyVacations";
import VacationWisher from "./components/VacationWisher";
import axios from 'axios';
const WrappedNormalLoginForm = Form.create()(Login);
const { Header, Content, Footer, Sider } = Layout;


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      status: null,
      name: null,
      current: '1',
      collapsed: false,
    };
  }
  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }
  logOut() {
    axios.get(`/api/logout`);
    this.setState({ status: 0 });

  }
  componentDidMount() {
    axios.get(`/api/getstatus`)
      .then(res => {
        this.setState({ status: res.data.status });
        if (res.data.status >= 1) {
          this.setState({ name: res.data.first_name + " " + res.data.last_name });
        };

      });

  }
  handleClick = (e) => {
    // console.log('click ', e);
    // console.log(e.key);
    // console.log("a");
    if (e.key !== undefined) {
      this.setState({
        current: e.key,
      });
    }

  }
  render() {

    return (
      <Layout  >
        <Sider style={{ height: '100vh' }}
          breakpoint="lg"
          collapsedWidth="0"
          onCollapse={(collapsed, type) => { console.log(collapsed, type); }}
        >

          <img src={logo} className="logo" />

          {this.state.status === 1 &&
            <Menu onClick={this.handleClick} theme="dark" mode="inline" defaultSelectedKeys={['1']}>
              <Menu.Item key="1">
                <Icon type="calendar" />
                <span className="nav-text">Wish vacation</span>
              </Menu.Item>
              <Menu.Item key="2">
                <Icon type="table" />
                <span className="nav-text">My vacations</span>
              </Menu.Item>
              <Menu.SubMenu key="sub" title={<span><Icon type="flag" /><span>Change language</span></span>}>
                <Menu.Item key="3">Swedish</Menu.Item>
                <Menu.Item key="4">Norwegian</Menu.Item>
                <Menu.Item key="5">Danish</Menu.Item>
                <Menu.Item key="6">English</Menu.Item>

              </Menu.SubMenu>
            </Menu>
          }
          {this.state.status === 2 &&
            <Menu onClick={this.handleClick} theme="dark" mode="inline" defaultSelectedKeys={['1']}>
              <Menu.Item key="1">
                <Icon type="calendar" />
                <span className="nav-text">Vacation periods</span>
              </Menu.Item>
              <Menu.Item key="2">
                <Icon type="user" />
                <span className="nav-text">Staff</span>
              </Menu.Item>
              <Menu.Item key="3">
                <Icon type="table" />
                <span className="nav-text">All applications</span>
              </Menu.Item>
              <Menu.SubMenu key="sub" title={<span><Icon type="flag" /><span>Change language</span></span>}>
                <Menu.Item key="4">Swedish</Menu.Item>
                <Menu.Item key="5">Norwegian</Menu.Item>
                <Menu.Item key="6">Danish</Menu.Item>
                <Menu.Item key="7">English</Menu.Item>

              </Menu.SubMenu>
            </Menu>
          }
        </Sider>
        {/* <Navbar fixedTop inverse collapseOnSelect>
          <Navbar.Header>
            <Navbar.Brand>
              <Image src={logo} alt="sasLogo" className="App-logo" />
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>

          <Navbar.Collapse>

            <Navbar.Form pullRight>
              {this.state.status >= 1 ?
                <Button
                  bsStyle="danger"
                  onClick={() => { axios.get(`/api/logout`) }}
                  href="/login"
                >Logout</Button> :
                <Button bsStyle="danger" href="/login">Login</Button>
              }
            </Navbar.Form>

            <Nav pullRight>
              {this.state.status >= 1 &&
                <Navbar.Text>
                  Signed in as: {this.state.name}
                </Navbar.Text>
              }
              <NavDropdown title="Change Language" id="basic-nav-dropdown">
                <MenuItem >Swedish</MenuItem>
                <MenuItem >Norwegian</MenuItem>
                <MenuItem >Danish</MenuItem>
                <MenuItem >English</MenuItem>
              </NavDropdown>

            </Nav>
            {this.state.status === 1 &&
              <Nav pullLeft>
                <LinkContainer to="/wishvacation">
                  <NavItem >Wish Vacation</NavItem>
                </LinkContainer>
                <LinkContainer to="/myvacations">
                  <NavItem >My Vacations</NavItem>
                </LinkContainer>
              </Nav>
            }
            {this.state.status === 2 &&
              <Nav pullLeft>
                <LinkContainer to="/overview">
                  <NavItem>Overview</NavItem>
                </LinkContainer>
                <LinkContainer to="/manage">
                  <NavItem>Manage</NavItem>
                </LinkContainer>
              </Nav>
            }
          </Navbar.Collapse>
        </Navbar> */}
        <Layout>
          <Header style={{ background: '#fff' }} >
            <Row type="flex" justify="end" align="top">
              <Col offset={1}>
                {this.state.status >= 1 &&
                  <span>
                    Signed in as: {this.state.name}
                  </span>
                }
              </Col>
              <Col offset={1}>
                {this.state.status >= 1 ? <Button type="danger" onClick={() => { this.logOut() }}>Logout</Button> :
                  null
                }
              </Col>
            </Row>
          </Header>

          <Content style={{ background: '#fff', padding: 24 }}>
            {this.state.status === 0 &&
              <div>
                <WrappedNormalLoginForm />
              </div>}
            {this.state.status === 2 &&
              <div>
                {this.state.current == 1 &&
                  <VacationPeriods />
                }
                {this.state.current == 2 &&
                  <Staff />
                }
                {this.state.current == 3 &&
                  <Applications />
                }
              </div>}
            {this.state.status === 1 &&
              <div>
                {this.state.current == 1 &&
                  <VacationWisher />
                }
                {this.state.current == 2 &&
                  <MyVacations />
                }
              </div>}
            {/* <Fragment><Route exact path="/" component={MyVacations} />
                <Route exact path="/login" component={MyVacations} />
                <Route exact path="/wishvacation" component={WishVacation} />
                <Route exact path="/myvacations" component={MyVacations} />
                <Route exact path="/overview" component={MyVacations} />
                <Route exact path="/manage" component={MyVacations} />
              </Fragment>
              {this.state.status === 2 &&
              <Fragment><Route exact path="/" component={AdminOverview} />
                <Route exact path="/login" component={AdminOverview} />
                <Route exact path="/overview" component={AdminOverview} />
                <Route exact path="/manage" component={AdminManage} />
                <Route exact path="/wishvacation" component={AdminOverview} />
                <Route exact path="/myvacations" component={AdminOverview} />
              </Fragment>}
            {this.state.status === 0 &&
              <Fragment><Route exact path="/" component={Login} />
                <Route exact path="/login" component={Login} />
                <Route exact path="/wishvacation" component={Login} />
                <Route exact path="/myvacations" component={Login} />
                <Route exact path="/overview" component={Login} />
                <Route exact path="/manage" component={Login} />
              </Fragment>} */}
            {/* <Switch>
            {this.state.status === 1 &&
              <Fragment><Route exact path="/" component={MyVacations} />
                <Route exact path="/login" component={MyVacations} />
                <Route exact path="/wishvacation" component={WishVacation} />
                <Route exact path="/myvacations" component={MyVacations} />
                <Route exact path="/overview" component={MyVacations} />
                <Route exact path="/manage" component={MyVacations} />
              </Fragment>}
            {this.state.status === 2 &&
              <Fragment><Route exact path="/" component={AdminOverview} />
                <Route exact path="/login" component={AdminOverview} />
                <Route exact path="/overview" component={AdminOverview} />
                <Route exact path="/manage" component={AdminManage} />
                <Route exact path="/wishvacation" component={AdminOverview} />
                <Route exact path="/myvacations" component={AdminOverview} />
              </Fragment>}
            {this.state.status === 0 &&
              <Fragment><Route exact path="/" component={Login} />
                <Route exact path="/login" component={Login} />
                <Route exact path="/wishvacation" component={Login} />
                <Route exact path="/myvacations" component={Login} />
                <Route exact path="/overview" component={Login} />
                <Route exact path="/manage" component={Login} />
              </Fragment>}

            <Route component={NotFound} />

          </Switch> */}
          </Content>
        </Layout>

      </Layout>

    );
  }
}
export default App;

