import React, { useEffect, useState } from 'react'
import { Form, Input, Button, Table, Modal } from 'antd'
import api from '../../../../../api/rule'

export default function GuideModal(props){
    const [enabledGuides, setEnabledGuides] = useState([])
    const [guidePageNum, setGuidePageNum] = useState(0)
    const [guideTableTotal, setGuideTableTotal] = useState(0)
    const [originData, setOriginData] = useState({})

    const [task_code, setTaskCode] = useState('')
    const [task_name, setTaskName] = useState('')

    const guideTable = {
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word', 
        wordBreak: 'break-all'
    }

    const splitIds = (id)=>{
        let ids = []
        let noEmpty = id.replace(/\s*/g, '')
        ids = noEmpty.split(',')
        return ids
    }

    const init = ()=>{
        if (!props.choosingGuide) return
        api.GetItemGuides({
            task_status: 0,
            page_size: 8,
            page_num: 0
        }).then(response=>{
            let data = response.data.data
            setGuideTableTotal(data.total)
            setEnabledGuides(data.data)
        }).catch(error=>{
            props.showError('选择指南初始化失败')
        })
    }

    useEffect(function(){
        // 当面板打开时获取首页指南
        init()
    }, [props.choosingGuide])

    const handleGuideTableChange = (page)=>{
        let totalData = originData
        totalData['task_status'] = 0
        totalData['page_num'] = page - 1
        totalData['page_size'] = 8
        // 换页的指南获取
        api.GetItemGuides(totalData).then(response=>{
            setGuidePageNum(page - 1)
            let data = response.data.data
            setGuideTableTotal(data.total)
            setEnabledGuides(data.data)
        }).catch(error=>{
            props.showError('选择指南换页失败')
        })
    }

    const handleTaskCodeChange = (e)=>{
        setTaskCode(e.target.value)
    }

    const handleTaskNameChange = (e)=>{
        setTaskName(e.target.value)
    }

    const clear = ()=>{
        // 清空搜索框
        document.getElementById('taskCodeInput').value = ''
        document.getElementById('taskNameInput').value = ''
        setTaskCode('')
        setTaskName('')
        // 重新初始化数据
        init()
    }

    const processData = ()=>{
        let data = {}
        if (task_code !== ''){
            let code = splitIds(task_code)
            data['task_code'] = code
        }
        if (task_name !== '') data['task_name'] = task_name
        search(data)
    }

    const search = (data)=>{
        setOriginData(data)
        let totalData = data
        totalData['task_status'] = 0
        totalData['page_num'] = 0
        totalData['page_size'] = 8
        // 搜索
        api.GetItemGuides(totalData).then(response=>{
            let data = response.data.data
            setGuideTableTotal(data.total)
            setEnabledGuides(data.data)
        }).catch(error=>{
            console.log(error)
            props.showError('搜索失败')
        })
    }

    const endChoosingGuide = ()=>{
        props.setChoosingGuide(false)
        setGuidePageNum(0)
        setEnabledGuides([])
        setTaskCode('')
        setTaskName('')
        setOriginData({})
    }

    const guideColumns = [
        {
            title: '指南编码',
            dataIndex: 'task_code',
            key: 'task_code',
            width: 320
        },
        {
            title: '指南名称',
            dataIndex: 'task_name',
            key: 'task_name'
        },
        {
            title: '选择',
            key: 'choose',
            width: 100,
            render: (text, record)=>(
                <Button type='primary' onClick={function(){
                    props.setTaskCode(record.task_code)
                    props.setTaskName(record.task_name)
                    endChoosingGuide()
                }}>
                    选择
                </Button>
            )
        }
    ]

    return (
        <Modal width={800} centered destroyOnClose={true} title='选择指南' visible={props.choosingGuide} footer={false} onCancel={endChoosingGuide}>
            <Form
                layout='inline'
                initialValues={{
                    layout: 'inline'
                }}
                style={{marginBottom: 10}}
            >
                <Form.Item label='指南编码' style={{width: '37%'}}>
                    <Input id='taskCodeInput' value={task_code}
                        placeholder='请输入指南编码' onChange={handleTaskCodeChange} />
                </Form.Item>
                <Form.Item label='指南名称' style={{width: '37%'}}>
                    <Input id='taskNameInput' value={task_name}
                        placeholder='请输入指南名称' onChange={handleTaskNameChange} />
                </Form.Item>
                <Form.Item style={{width: '8%'}}>
                    <Button type='default' onClick={clear}>重置</Button>
                </Form.Item>
                <Form.Item style={{width: '8%'}}>
                    <Button type='primary' onClick={processData}>搜索</Button>
                </Form.Item>
            </Form>
            <Table class={guideTable} columns={guideColumns} dataSource={enabledGuides} rowKey='task_code'
                pagination={{total: guideTableTotal, onChange: handleGuideTableChange, current: guidePageNum + 1, showSizeChanger: false, pageSize: 8}}/>
        </Modal>
    )
}