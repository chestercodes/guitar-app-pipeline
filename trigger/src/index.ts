import { handle as handleS3Event, isS3Trigger } from './s3/handler'
import { handle as handleInvokeTrigger, isInvokeTrigger } from './invoke/handler'

exports.handler = async (event: any, context: any) => {
  if (isS3Trigger(event)) {
    await handleS3Event(event)
    return
  }

  if (isInvokeTrigger(event)) {
    await handleInvokeTrigger(event)
    return
  }

  console.log("Cannot handle event :(")
  console.log(JSON.stringify(event))
};
