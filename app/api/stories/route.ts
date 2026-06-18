import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { prenom, code, anecdote } = await request.json();

    const { data, error } = await supabase
      .from('anecdotes')
      .insert([{ prenom, code, histoire: anecdote }])
      .select();

    if (error) {
      console.error('❌ Erreur Supabase :', error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Anecdote envoyée !', data });
  } catch (error) {
    console.error('❌ Erreur serveur :', error);
    return NextResponse.json(
      { success: false, message: 'Erreur interne' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('anecdotes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erreur récupération :', error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('❌ Erreur serveur :', error);
    return NextResponse.json(
      { success: false, message: 'Erreur interne' },
      { status: 500 }
    );
  }
}