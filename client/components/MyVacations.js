import React, { Component } from "react";
import moment from 'moment';
import { Tabs, Row, Col, Radio, Divider, Table, DatePicker, Form, Button, Input } from 'antd';
import axios from 'axios';

export default class MyVacations extends Component {
  constructor(props) {
    super(props);
    this.state = {
      vacations: [],
    };
  }
  componentDidMount() {
    this.getVacations();
  }
  getVacations() {
    axios.get(`/api/getvacations`)
      .then(res => {
        var vacations = res.data;
        for (var i = 0; i < vacations.length; i++) {
                    
          vacations[i].key = vacations[i].id;
      }
        this.setState({ vacations });
      })
  }
  render() {
    const columns = [{
      title: 'Period name',
      dataIndex: 'name',
      key: 'name',
      defaultSortOrder: 'descend',
  sorter: (a, b) => a.name - b.name,
    }, {
      title: 'Vacation no',
      dataIndex: 'vacation_no',
      key: 'vacation_no',
    }, {
      title: 'Choice no',
      dataIndex: 'choice_no',
      key: 'choice_no',
    }, {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    }, {
      title: 'Start date',
      dataIndex: 'start_date',
      key: 'start_date',
      render: (text, record) => <span>{moment(record.start_date).format('YYYY-MM-DD')}</span>,
    }, {
      title: 'End date',
      dataIndex: 'end_date',
      key: 'end_date',
      render: (text, record) => <span>{moment(record.end_date).format('YYYY-MM-DD')}</span>,
    }, {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (text, record) => <span>{record.status === 0 && 'Not reviewed'}{record.status === 1 && 'Denied'}{record.status === 2 && 'Accepted'}</span>,
    } 
  ];
    return (
      <div>
        <p>Here you can see status of your upcoming vacations as well as you vacation history</p>
        <Table columns={columns} dataSource={this.state.vacations} />
      </div>
    )
  }
}

