"use client"
import axios from 'axios';
import * as z from "zod";
import {zodResolver} from "@hookform/resolvers/zod"
import { useForm } from 'react-hook-form'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from '@/components/ui/dialog'

  import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from '@/components/ui/form'

  import { Input } from '@/components/ui/input'

  import { Button } from '@/components/ui/button'
import { useEffect, useState } from "react";
import { FileUpload } from "../file-upload";
import { useRouter } from 'next/navigation'

const formSchema = z.object({
    name: z.string().min(1, {
      message: 'Workspace Name Required',
    }),
    imageUrl: z.string().min(1, {
      message: 'Workspace Image Required',
    }),
  })


const InitialModal = () => {

    const [isMounted, setIsMounted] = useState(false)

    
  const router = useRouter()

    useEffect(() => {
        setIsMounted(true);
      }, [])
    

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
          name: '',
          imageUrl: '',
        },
    })


    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await axios.post('/api/servers', values)
      
            form.reset()
            router.refresh()
            window.location.reload()
          } catch (error) {
            console.log(error)
          }
    }

    if (!isMounted) {
        return null
      }
    
    return (     
    <Dialog open>
        <DialogContent
          className='bg-white text-black p-0 overflow-hidden'
          
        >
          <DialogHeader className='pt-8 px-6'>
            <DialogTitle
              id='customize-first-server'
              className='text-2xl text-center font-bold'
            >
              Customize Your Workspace
            </DialogTitle>
            <DialogDescription className='text-center text-zinc-500'>
              Give your workspace a custom look with a name and image. It can be
              changed later...
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
              <div className='space-y-8 px-6'>
                <div className='flex items-center justify-center text-center'>
                  <FormField
                    control={form.control}
                    name='imageUrl'
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <FileUpload
                            endpoint='serverImage'
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
  
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70'>
                        Workspace Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          autoComplete='off'
                          disabled={isLoading}
                          className='bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0'
                          placeholder='Enter Workspace Name...'
                          {...field}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter className='bg-gray-100 px-6 py-4'>
                <Button variant={'primary'}>Create</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>);
}
 
export default InitialModal;