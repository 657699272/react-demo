import React, { useEffect, useContext, useState, useRef } from 'react';
import { Table, Popover, Popconfirm, Form, Input } from 'antd';
import { Console } from 'console';
const EditableContext = React.createContext(null);

const TableData = () => {
  const EditableRow = ({ index, ...props }) => {
    const [form] = Form.useForm();
    return (
      <Form form={form} component={false}>
        <EditableContext.Provider value={form}>
          <tr {...props} />
        </EditableContext.Provider>
      </Form>
    );
  };

  const EditableCell = ({
    title,
    editable,
    children,
    dataIndex,
    record,
    handleSave,
    ...restProps
  }) => {
    const [editing, setEditing] = useState(false);
    const inputRef = useRef(null);
    const form = useContext(EditableContext);
    useEffect(() => {
      if (editing) {
        inputRef.current.focus();
      }
    }, [editing]);

    const toggleEdit = () => {
      setEditing(!editing);
      form.setFieldsValue({
        [dataIndex]: record[dataIndex],
      });
    };

    const save = async () => {
      try {
        const values = await form.validateFields();
        toggleEdit();
        handleSave({ ...record, ...values });
      } catch (errInfo) {
        console.log('Save failed:', errInfo);
      }
    };

    let childNode = children;

    if (editable) {
      childNode = editing ? (
        <Form.Item
          style={{
            margin: 0,
          }}
          name={dataIndex}
          rules={[
            {
              required: true,
              message: `${title} is required.`,
            },
          ]}
        >
          <Input ref={inputRef} onPressEnter={save} onBlur={save} />
        </Form.Item>
      ) : (
        <div
          className="editable-cell-value-wrap"
          style={{
            paddingRight: 24,
          }}
          onClick={toggleEdit}
        >
          {children}
        </div>
      );
    }

    return <td {...restProps}>{childNode}</td>;
  };

  let source = []
  for (let i = 1; i <= 100; i++) {
    let obj:any = {}
    for(let j=1;j<=16;j++){
      const index = 'd'+j
      obj[index] = Math.floor(Math.random() * 100);
    }
    source.push({
      ...obj,
      key: i,
      address: '0x00000' + i+':',
    })
  }

  const [dataSource, setDataSource] = useState(source)

  const dataConvert = (data: string) => {
    return (
      <div>
        <p>二进制是：{Number(data).toString(2)}</p>
        <p>十进制是：{data}</p>
        <p>十六进制是：{Number(data).toString(16).toUpperCase()}</p>
      </div>
    )
  }

  let columns = []
  for(let i=1;i<=16;i++){
    if(i == 1){
      columns.push({
        title: 'offset:',
        dataIndex: 'address',
        key: 'address',
        width:60,
        align:'right'
      })
    }else{
      let index = 'd'+(i-1);
      columns.push({
        title: index,
        dataIndex: index,
        key: index,
        editable: true,
        width:20,
        align:'center',
        onCell: (record: any) => ({
          record,
          editable: true,
          dataIndex: index,
          title: index,
          handleSave: handleSave,
          align:'center',
        }),
        render: (d: any) => (
          <span style={{
            cursor:'pointer'
          }}>
            <Popover content={dataConvert(d)} title="数据转换">
              {d}
            </Popover>
          </span>
        ),
      })
    }
  }

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const handleSave = (row: any) => {
    console.log(row)
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, { ...item, ...row });

    setDataSource(newData);
  };

  return <Table dataSource={dataSource} columns={columns} components={components} pagination={{
    size: 'small',
    showSizeChanger: false,
    showQuickJumper: false,
    defaultCurrent: 1,
    pageSize: 50
  }} />;
};

export default TableData;
